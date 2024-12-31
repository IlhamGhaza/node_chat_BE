import { Pool } from "pg";

const pool = new Pool({
    user: "d3velopment", //"postgres", 
    host: "localhost",
    database: "node_chat_be",
    password: "S3cureP@ass$953!", //"postgres",
    port: 5432,
})
    
export default pool;
