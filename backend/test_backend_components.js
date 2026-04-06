const supabase = require('./config/supabaseClient');
const bcrypt = require('bcryptjs');

async function testSupabase() {
    console.log("Testing Supabase connectivity...");
    try {
        const { data, error } = await supabase.from('users').select('*').limit(1);
        if (error) {
            console.error("Supabase Error:", error);
        } else {
            console.log("Supabase Success! Found", data.length, "users.");
        }
    } catch (err) {
        console.error("Caught Exception:", err);
    }
}

async function testBcrypt() {
    console.log("Testing Bcrypt...");
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash("password123", salt);
        console.log("Bcrypt Success! Hash:", hash);
    } catch (err) {
        console.error("Bcrypt Error:", err);
    }
}

async function runTests() {
    await testSupabase();
    await testBcrypt();
    process.exit(0);
}

runTests();
