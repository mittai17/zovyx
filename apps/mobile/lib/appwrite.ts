import { Client, Account } from 'react-native-appwrite';

const client = new Client();

client
    .setEndpoint('https://cloud.appwrite.io/v1') // Replace with actual or env var
    .setProject('replace-with-project-id')
    .setPlatform('com.zuvix.mobile');

export const account = new Account(client);
export { client };
