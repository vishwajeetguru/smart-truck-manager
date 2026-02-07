import db from './backend/db.js';
const { query } = db;
async function checkData() {
    try {
        const res = await query("SELECT id, owner_id, name FROM drivers WHERE id = '427addb1-bfb3-4ecf-9a4c-838c93f40409'");
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
checkData();
