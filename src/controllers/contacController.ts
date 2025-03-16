import { Request, Response } from "express";
import pool from "../models/db";
import { ApiResponse } from "../types/api";

export const fetchContact = async (req: Request, res: Response<ApiResponse<any>>) => {
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
                u.id AS contact_id,
                u.username,
                u.email,
                u.photo_profile
            FROM contacts c
            JOIN users u ON u.id = c.contact_id
            WHERE c.user_id = $1 AND c.deleted_at IS NULL
            ORDER BY u.username ASC
        `, [userId]);

        return res.json({
            message: "Contacts retrieved successfully",
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        return res.status(500).json({
            message: "Internal server error",
            data: null
        });
    }
};
export const fetchAllContacts = async (req: Request, res: Response<ApiResponse<any>>) => {
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
                u.id AS contact_id,
                u.username,
                u.email,
                u.photo_profile
            FROM contacts c
            JOIN users u ON u.id = c.contact_id
            WHERE c.user_id = $1 AND c.deleted_at IS NULL
            ORDER BY u.username ASC
        `, [userId]);

        return res.json({
            message: "Contacts retrieved successfully",
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        return res.status(500).json({
            message: "Internal server error",
            data: null
        });
    }
};


export const addContact = async (req: Request, res: Response<ApiResponse<any>>) => {
    const userId = req.user?.id;
    const { contactID, email, username } = req.body;

    if (!userId) {
        return res.status(401).json({
            message: "Unauthorized",
            data: null
        });
    }

    if (!contactID && !email && !username) {
        return res.status(400).json({
            message: "At least one of contactID, email, or username is required",
            data: null
        });
    }

    try {
        let contactExists;
        let contactId;

        // Check if the contact exists based on the provided identifier
        if (contactID) {
            contactExists = await pool.query(
                "SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL",
                [contactID]
            );
            contactId = contactID;
        } else if (email) {
            contactExists = await pool.query(
                "SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL",
                [email]
            );
            contactId = contactExists.rows[0]?.id;
        } else if (username) {
            contactExists = await pool.query(
                "SELECT id FROM users WHERE username = $1 AND deleted_at IS NULL",
                [username]
            );
            contactId = contactExists.rows[0]?.id;
        }

        if (!contactExists || contactExists.rowCount === 0) {
            return res.status(404).json({
                message: "Contact not found",
                data: null
            });
        }

        // Prevent adding yourself as a contact
        if (contactId === userId) {
            return res.status(400).json({
                message: "You cannot add yourself as a contact",
                data: null
            });
        }

        const result = await pool.query(
            `INSERT INTO contacts (user_id, contact_id)
             VALUES ($1, $2)
             ON CONFLICT (user_id, contact_id) DO NOTHING
             RETURNING *`,
            [userId, contactId]
        );

        // Get the contact details to return
        const contactDetails = await pool.query(`
            SELECT 
                u.id AS contact_id,
                u.username,
                u.email,
                u.photo_profile
            FROM users u
            WHERE u.id = $1
        `, [contactId]);

        return res.status(201).json({
            message: "Contact added successfully",
            data: contactDetails.rows[0] || null
        });
    } catch (error) {
        console.error('Error adding contact:', error);
        return res.status(500).json({
            message: "Internal server error",
            data: null
        });
    }
};


//delete contact
export const deleteContact = async (req: Request, res: Response<ApiResponse<any>>) => {
    const userId = req.user?.id;
    const { contactID } = req.body;
    if (!userId) {
        return res.status(401).json({
            message: "Unauthorized",
            data: null
        });
    }
    if (!contactID) {
        return res.status(400).json({
            message: "Contact ID is required",
            data: null
        });
    }
    try {
        const contactExists = await pool.query(
            "SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL",
            [contactID]
        );
        if (contactExists.rowCount === 0) {
            return res.status(404).json({
                message: "Contact not found",
                data: null
            });
        }
        await pool.query(
            `DELETE FROM contacts
             WHERE user_id = $1 AND contact_id = $2`,
            [userId, contactID]
        );
        return res.status(200).json({
            message: "Contact deleted successfully",
            data: { null: null }
        });
    } catch (error) {
        console.error('Error deleting contact:', error);
        return res.status(500).json({
            message: "Internal server error",
            data: null
        });
    }
};

