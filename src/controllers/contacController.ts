import { Request, Response } from "express";
import pool from "../models/db";

export const fetchContact = async (
    req: Request,
    res: Response
): Promise<any> => {
    let userId = null;
    if (req.user) {
        userId = req.user.id;
    }
    console.log("User ID:", userId);

    try {
        const result = await pool.query(

            `
            SELECT u.id, AS contact_id, u.username, u.email
            FROM contacts c
            JOIN users u ON u.id = c.contact_id
            WHERE c.user_id = $1
            ORDER BY u.username ASC
            `
            [userId]
        );
        console.log("Fetched contact:", result.rows);
        res.json(result.rows);
    } catch (err) {
        if (err instanceof Error) {
            console.error('Error fetching contact:', err);
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            console.error('Unknown error:', err);
            res.status(500).json({ error: "Unknown Error" });
        }

    }
};

export const addContact = async (req: Request, res: Response): Promise<any> => {
    let userId = null;
    if (req.user) {
        userId = req.user.id;
    }
    console.log("User ID:", userId);
    const { contactID } = req.body;

    try {
        const contactExists = await pool.query(
            `
               SELECT id from users where id = $1
                `,
            [contactID]
        );
        if (contactExists.rowCount === 0) {
            return res.status(404).json({ error: "Contact not found" });
        }
        await pool.query(
            `
            INSERT INTO contacts (user_id, contact_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
            `,
            [userId, contactID]

        );
        res.status(201).json({ message: "Contact added successfully" });
        console.log("Contact added :", contactID);

    } catch (err) {
        //error handling
        if (err instanceof Error) {
            console.error('Error adding contact:', err);
            res.status(500).json({ error: "Failed to add contact" });
        } else {
            console.error('Unknown error:', err);
            res.status(500).json({ error: "Unknown Error" });
        }

    }
};

//deletee contact
export const deleteContact = async (req: Request, res: Response): Promise<any> => {
    let userId = null;
    if (req.user) {
        userId = req.user.id;
    }
    console.log("User ID:", userId);
    const { contactID } = req.body;

    try {
        const contactExists = await pool.query(
            `
               SELECT id from users where id = $1
                `,
            [contactID]
        );
        if (contactExists.rowCount === 0) {
            return res.status(404).json({ error: "Contact not found" });
        }
        await pool.query(
            `
            DELETE FROM contacts
            WHERE user_id = $1 AND contact_id = $2
            `,
            [userId, contactID]
        );
        res.status(200).json({ message: "Contact deleted successfully" });
        console.log("Contact deleted :", contactID);

    } catch (err) {
        //error handling
        if (err instanceof Error) {
            console.error('Error deleting contact:', err);
            res.status(500).json({ error: "Failed to delete contact" });
        } else {
            console.error('Unknown error:', err);
            res.status(500).json({ error: "Unknown Error" });
        }
    }
}
