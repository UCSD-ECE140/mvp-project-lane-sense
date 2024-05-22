import {StatusBar} from 'expo-status-bar';
import {Text, View} from 'react-native';
import {Link} from 'expo-router';

export default function App() {
    return (
        <View className="flex-1 items-center justify-center bg-primary">
            <Text className = "font-pblack text-3xl">pookie</Text>
            <StatusBar style = "auto"/>
            <Link href = "/profile" style = {{color: 'blue'}}>Go to Profile</Link>
            <Link href = "/home" style = {{color: 'blue'}}>Go to Home</Link>
            <Link href = "/(tabs)/your-pookie" style = {{color: 'blue'}}>Go to Your Pookie</Link>
        </View>
    );
}
