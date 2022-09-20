import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAnvgE2SiY6pDitlYj6REIZ-SK_wc9SjXQ",
  authDomain: "tact-testing.firebaseapp.com",
  projectId: "tact-testing",
  storageBucket: "tact-testing.appspot.com",
  messagingSenderId: "396369509022",
  appId: "1:396369509022:web:c6792776c7058391ae198f",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const TACT_API_URL = process.env.TACT_API_URL ?? "http://localhost:5000";

export const getUploadUrl = (id: string | number): string => `${TACT_API_URL}/image/${id}`;

export const uploadVideoToFirebase = (id: number, data: Blob): ReturnType<typeof uploadBytes> => {
  const storage = getStorage(app, "gs://tact-finals");
  const storageRef = ref(storage, `${id}.webm`);
  return uploadBytes(storageRef, data);
};
export const uploadVideo = (id: number | string, data: Blob): Promise<Response> => {
  return fetch(getUploadUrl(id), {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "image/png",
    },
  });
};

export const downloadVideo = (id: number, blob: Blob): void => {
  if (typeof id !== "number") return;
  const link = document.createElement("a");
  link.download = `${id}.webm`;
  link.href = window.webkitURL.createObjectURL(blob);
  link.click();
  link.remove();
};
