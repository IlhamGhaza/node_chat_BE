import { Pool } from "pg";

const pool = new Pool({
    user: "d3velopment", //"postgres", 
    host: "localhost",
    database: "node_chat_be",
    password: '${DB_PASSWORD}',
    port: 5432,
})

export async function savePhotoProfile(userId: number, photoUrl: string) {
    try {
        const result = await pool.query(
            "UPDATE users SET photo_profile = $1 WHERE id = $2",
            [photoUrl, userId]
        );
        return result;
    } catch (error) {
        console.error(error);
        return null;
    }
}
    
export default pool;
