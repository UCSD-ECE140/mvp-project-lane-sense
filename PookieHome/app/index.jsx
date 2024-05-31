import {StatusBar} from 'expo-status-bar';
import {Alert, Text, View} from 'react-native';
import {Link} from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
    return (
        <SafeAreaView className="h-full">
            <View className="flex-1 items-center justify-center bg-primary">
                <Text className = "font-pblack text-3xl">pookie</Text>
                <StatusBar style = "auto"/>
                <Link href = "/profile" style = {{color: 'blue'}}>Go to Profile</Link>
                <Link href = "/home" style = {{color: 'blue'}}>Go to Home</Link>
                <Link href = "/(tabs)/your-pookie" style = {{color: 'blue'}}>Go to Your Pookie</Link>
            </View>
        </SafeAreaView>
    );
}
