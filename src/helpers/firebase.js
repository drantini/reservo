import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
    apiKey: "AIzaSyClZyAC8KqAqo9qW8XtWtiCDRRtnRZjPVo",
    authDomain: "reservo-db3e5.firebaseapp.com",
    projectId: "reservo-db3e5",
    storageBucket: "reservo-db3e5.appspot.com",
    messagingSenderId: "1038248896580",
    appId: "1:1038248896580:web:4b9e376f0f760e8bec3411",
    measurementId: "G-N9VDJ5QC78"

})

export const auth = firebase.auth;
export const firestore = firebase.firestore;