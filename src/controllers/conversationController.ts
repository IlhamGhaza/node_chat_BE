import { Request, Response } from "express";
import pool from "../models/db";
import { ApiResponse } from "../types/api";

export const fetchAllConversationsByUserId = async (req: Request, res: Response<ApiResponse<any>>) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({
            message: "Unauthorized",
            data: null
        });
    }

    try {
        const result = await pool.query(`
            SELECT 
                c.id AS conversationId,
                u.id AS participant_id,
                u.username AS participant_name,
                u.photo_profile AS participant_photo,
                m.content AS last_message,
                m.created_at AS last_message_time
            FROM conversations c
            JOIN users u ON (c.participant_two = u.id AND u.id != $1)
            LEFT JOIN LATERAL (
                SELECT content, created_at 
                FROM messages 
                WHERE conversation_id = c.id 
                ORDER BY created_at DESC 
                LIMIT 1
            ) m ON TRUE
            WHERE (c.participant_one = $1 OR c.participant_two = $1)
                AND c.deleted_at IS NULL
            ORDER BY m.created_at DESC NULLS LAST`,
            [userId]
        );

        // Process the results to replace null photo_profile with first letter of username
        const processedConversations = result.rows.map(conversation => ({
            ...conversation,
            participant_photo: conversation.participant_photo ||
                (conversation.participant_name ? conversation.participant_name.charAt(0).toUpperCase() : 'U')
        }));

        return res.json({
            message: "Conversations retrieved successfully",
            data: processedConversations
        });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return res.status(500).json({
            message: "Internal server error",
            data: null
        });
    }
}

/**
 * Check if a conversation exists between two users or create a new one
 * @route POST /api/conversations
 */
export const checkOrCreateConversation = async (req: Request, res: Response<ApiResponse<any>>) => {
    const userId = req.user?.id;
    const { participantId } = req.body;

    if (!userId) {
        return res.status(401).json({
            message: "Unauthorized",
            data: null
        });
    }

    if (!participantId) {
        return res.status(400).json({
            message: "Participant ID is required",
            data: null
        });
    }

    // Ensure users aren't the same
    if (userId === parseInt(participantId)) {
        return res.status(400).json({
            message: "Cannot create conversation with yourself",
            data: null
        });
    }

    try {
        // Begin transaction
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Check if user exists
            const userExists = await client.query(
                'SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL',
                [participantId]
            );

            if (userExists.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({
                    message: "Participant not found",
                    data: null
                });
            }

            // Check if conversation already exists
            const existingConversation = await client.query(
                `SELECT id FROM conversations 
                WHERE ((participant_one = $1 AND participant_two = $2) 
                OR (participant_one = $2 AND participant_two = $1))
                AND deleted_at IS NULL`,
                [userId, participantId]
            );

            let conversationId;

            if (existingConversation.rows.length > 0) {
                // Conversation exists
                conversationId = existingConversation.rows[0].id;
            } else {
                // Create new conversation
                const newConversation = await client.query(
                    `INSERT INTO conversations (participant_one, participant_two)
                    VALUES ($1, $2) RETURNING id`,
                    [userId, participantId]
                );

                conversationId = newConversation.rows[0].id;
            }

            // Get conversation details
            const conversationDetails = await client.query(
                `SELECT 
                    c.id AS conversationId,
                    u.id AS participant_id,
                    u.username AS participant_name,
                    u.photo_profile AS participant_photo
                FROM conversations c
                JOIN users u ON (u.id = $2)
                WHERE c.id = $1 AND c.deleted_at IS NULL`,
                [conversationId, participantId]
            );

            // Process the result to replace null photo_profile with first letter of username
            const processedConversation = conversationDetails.rows[0] ? {
                ...conversationDetails.rows[0],
                participant_photo: conversationDetails.rows[0].participant_photo ||
                    (conversationDetails.rows[0].participant_name ?
                        conversationDetails.rows[0].participant_name.charAt(0).toUpperCase() : 'U')
            } : null;

            await client.query('COMMIT');

            return res.status(existingConversation.rows.length > 0 ? 200 : 201).json({
                message: existingConversation.rows.length > 0
                    ? "Conversation found"
                    : "Conversation created successfully",
                data: processedConversation
            });

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error checking/creating conversation:', error);
        return res.status(500).json({
            message: "Internal server error",
            data: null
        });
    }
}

/**
 * Get a specific conversation by ID
 * @route GET /api/conversations/:id
 */
export const getConversationById = async (req: Request, res: Response<ApiResponse<any>>) => {
    const userId = req.user?.id;
    const conversationId = req.params.id;

    if (!userId) {
        return res.status(401).json({
            message: "Unauthorized",
            data: null
        });
    }

    try {
        // First check if the user is a participant in this conversation
        const participantCheck = await pool.query(
            `SELECT id FROM conversations 
            WHERE id = $1 
            AND (participant_one = $2 OR participant_two = $2)
            AND deleted_at IS NULL`,
            [conversationId, userId]
        );

        if (participantCheck.rows.length === 0) {
            return res.status(403).json({
                message: "You don't have access to this conversation",
                data: null
            });
        }

        // Get conversation details with the other participant's info
        const result = await pool.query(
            `SELECT 
                c.id AS conversationId,
                u.id AS participant_id,
                u.username AS participant_name,
                u.photo_profile AS participant_photo
            FROM conversations c
            JOIN users u ON (
                (c.participant_one = u.id OR c.participant_two = u.id) 
                AND u.id != $2
            )
            WHERE c.id = $1 AND c.deleted_at IS NULL`,
            [conversationId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Conversation not found",
                data: null
            });
        }

        // Process the result to replace null photo_profile with first letter of username
        const processedConversation = {
            ...result.rows[0],
            participant_photo: result.rows[0].participant_photo ||
                (result.rows[0].participant_name ?
                    result.rows[0].participant_name.charAt(0).toUpperCase() : 'U')
        };

        return res.json({
            message: "Conversation retrieved successfully",
            data: processedConversation
        });
    } catch (error) {
        console.error('Error fetching conversation:', error);
        return res.status(500).json({
            message: "Internal server error",
            data: null
        });
    }
}

/**
 * Delete a conversation (soft delete)
 * @route DELETE /api/conversations/:id
 */
export const deleteConversation = async (req: Request, res: Response<ApiResponse<any>>) => {
    const userId = req.user?.id;
    const conversationId = req.params.conversationId;

    if (!userId) {
        return res.status(401).json({
            message: "Unauthorized",
            data: null
        });
    }

    try {
        // Check if the user is a participant in this conversation
        const participantCheck = await pool.query(
            `SELECT id FROM conversations 
            WHERE id = $1 
            AND (participant_one = $2 OR participant_two = $2)
            AND deleted_at IS NULL`,
            [conversationId, userId]
        );

        if (participantCheck.rows.length === 0) {
            return res.status(403).json({
                message: "You don't have access to this conversation",
                data: null
            });
        }

        // Soft delete the conversation only for this user
        await pool.query(
            `UPDATE conversations 
            SET deleted_at = CURRENT_TIMESTAMP 
            WHERE id = $1 AND (participant_one = $2 OR participant_two = $2)`,
            [conversationId, userId]
        );

        return res.json({
            message: "Conversation deleted successfully",
            data: null
        });
    } catch (error) {
        console.error('Error deleting conversation:', error);
        return res.status(500).json({
            message: "Internal server error",
            data: null
        });
    }
};

export const deleteMessage = async (req: Request, res: Response<ApiResponse<any>>) => {
    const userId = req.user?.id;
    const { conversationId, messageId } = req.params;

    if (!userId) {
        return res.status(401).json({
            message: "Unauthorized",
            data: null
        });
    }

    try {
        // Check if the user is a participant in this conversation and the message exists
        const messageCheck = await pool.query(
            `SELECT m.id 
            FROM messages m
            JOIN conversations c ON m.conversation_id = c.id
            WHERE m.id = $1 AND c.id = $2 
            AND (c.participant_one = $3 OR c.participant_two = $3)
            AND m.deleted_at IS NULL`,
            [messageId, conversationId, userId]
        );

        if (messageCheck.rows.length === 0) {
            return res.status(403).json({
                message: "You don't have access to this message or it doesn't exist",
                data: null
            });
        }

        // Soft delete the message
        await pool.query(
            `UPDATE messages 
            SET deleted_at = CURRENT_TIMESTAMP 
            WHERE id = $1`,
            [messageId]
        );

        return res.json({
            message: "Message deleted successfully",
            data: null
        });
    } catch (error) {
        console.error('Error deleting message:', error);
        return res.status(500).json({
            message: "Internal server error",
            data: null
        });
    }
};

export const deleteAllMessages = async (req: Request, res: Response<ApiResponse<any>>) => {
    const userId = req.user?.id;
    const { conversationId } = req.params;

    if (!userId) {
        return res.status(401).json({
            message: "Unauthorized",
            data: null
        });
    }

    try {
        // Check if the user is a participant in this conversation
        const participantCheck = await pool.query(
            `SELECT id FROM conversations 
            WHERE id = $1 
            AND (participant_one = $2 OR participant_two = $2)
            AND deleted_at IS NULL`,
            [conversationId, userId]
        );

        if (participantCheck.rows.length === 0) {
            return res.status(403).json({
                message: "You don't have access to this conversation",
                data: null
            });
        }

        // Soft delete all messages in the conversation
        await pool.query(
            `UPDATE messages 
            SET deleted_at = CURRENT_TIMESTAMP 
            WHERE conversation_id = $1`,
            [conversationId]
        );

        return res.json({
            message: "All messages in the conversation deleted successfully",
            data: null
        });
    } catch (error) {
        console.error('Error deleting all messages:', error);
        return res.status(500).json({
            message: "Internal server error",
            data: null
        });
    }
};