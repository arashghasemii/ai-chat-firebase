const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");


admin.initializeApp();
const db = admin.firestore();

exports.handleMessage = functions.https.onCall(async (data, context) => {
    const { user_id, message_text } = data;
    const docRef = await db.collection("user_messages").add({
        user_id,
        message_text,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        response_text: "در حال پاسخ‌گویی..."
    });

    // try {
    //     const openaiRes = await axios.post(
    //         "https://api.openai.com/v1/chat/completions",
    //         {
    //             model: "gpt-3.5-turbo",
    //             messages: [{ role: "user", content: message_text }]
    //         },
    //         {
    //             headers: {
    //                 "Authorization": ``,// چون از ai  فرضی استفاده کردم api کد نذاشتم
    //                 "Content-Type": "application/json"
    //             }
    //         }
    //     );

    //     const reply = openaiRes.data.choices[0].message.content;
    //     await docRef.update({ response_text: reply });
    //     return { response_text: reply };
    // } catch (e) {
    //     await docRef.update({ response_text: "خطا در پاسخ از OpenAI" });
    //     throw new functions.https.HttpsError("internal", "AI error");
    // }
});
