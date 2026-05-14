const { getLocationIntelligence } = require("./services/locationIntelligence");

async function test() {
    try {
        const result = await getLocationIntelligence(17.3850, 78.4867); // Hyderabad coords
        console.log("Success:", result);
    } catch (e) {
        console.error("Test Error:", e);
    }
}
test();
