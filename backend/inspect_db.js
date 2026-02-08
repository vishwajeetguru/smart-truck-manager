const { query } = require('./db');

(async () => {
    try {
        console.log("Checking constraints on 'trips' table...");
        const res = await query(`
            SELECT conname, pg_get_constraintdef(oid)
            FROM pg_constraint
            WHERE conrelid = 'trips'::regclass
        `);
        console.log(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
})();
