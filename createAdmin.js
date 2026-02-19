import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Configuration from src/lib/firebase.ts
const firebaseConfig = {
    apiKey: "AIzaSyANIzhEnkCdwE0OI4PbFOJoMQ6hmr3v8ck",
    authDomain: "amp-mediao.firebaseapp.com",
    projectId: "amp-mediao",
    storageBucket: "amp-mediao.firebasestorage.app",
    messagingSenderId: "108934256291",
    appId: "1:108934256291:web:d993cada6cdf129b665116",
    measurementId: "G-3146N70ZPV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Use credentials provided by user
const email = "dyhardeveloper@gmail.com";
const password = "113114";

async function createAdmin() {
    let user;

    try {
        console.log(`Attempting to create admin user: ${email}...`);
        // 1. Try to Create User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        user = userCredential.user;
        console.log("User created in Authentication. UID:", user.uid);

    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            console.log("User already exists in Firebase Authentication.");
            console.log("Attempting to sign in to retrieve UID...");

            try {
                // If user exists, try to sign in to get the UID (to update Firestore)
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                user = userCredential.user;
                console.log("Logged in successfully. UID:", user.uid);
            } catch (loginError) {
                console.error("Could not login to existing user to update role. Please ensure the password is correct.");
                console.error(loginError.message);
                process.exit(1);
            }
        } else {
            console.error("Error creating user:", error);
            process.exit(1);
        }
    }

    // 2. Create/Update Admin Profile in Firestore (Idempotent)
    if (user) {
        console.log(`Updating Firestore profile for UID: ${user.uid}...`);
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: user.email,
            name: "Super Admin",
            role: "admin", // Ensure admin role is set
            updatedAt: new Date().toISOString()
        }, { merge: true }); // Merge to avoid overwriting other fields if they exist

        console.log("SUCCESS: Admin permissions set in Firestore.");
        console.log("You can now login at /login");
        process.exit(0);
    }
}

createAdmin();
