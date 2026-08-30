// react-native-firebase reads config from android/app/google-services.json
// at build time — no inline config object needed here (unlike the web
// version). Just import and use the modules directly.
import auth from '@react-native-firebase/auth'
import database from '@react-native-firebase/database'

export const firebaseAuth = auth()
export const firebaseDb = database()
