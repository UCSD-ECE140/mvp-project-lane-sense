import {useState} from "react";
import {Link, router} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import {View, Text, ScrollView, Dimensions, Alert} from "react-native";

import FormField from "../../components/FormField";
import CustomButton from "../../components/Custom Button";


const createUser = async (email, password, username) => {
    console.log(process.env.EXPO_PUBLIC_BACKEND_URL);
    const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/user/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({email, password, username}),
    });
    if (!response.ok) {
        throw new Error("An error occurred while signing up");
    }
    return await response.json();
}

const SignUp = () => {
    const [isSubmitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        username: "", email: "", password: "",
    });

    const submit = async () => {
        if (form.username === "" || form.email === "" || form.password === "") {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }
        setSubmitting(true);
        try {
            const result = await createUser(form.email, form.password, form.username);
            console.log(result);
            router.navigate("/sign-in");
        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (<SafeAreaView className="bg-pastel-blue h-full">
            <ScrollView>
                <View
                    className="w-full flex justify-center h-full px-4"
                    style={{
                        minHeight: Dimensions.get("window").height - 100,
                    }}
                >
                    <Text className="text-2xl font-semibold text-black mt-10 font-psemibold">
                        Sign Up to Pookie
                    </Text>

                    <FormField
                        title="Username"
                        value={form.username}
                        handleChangeText={(e) => setForm({...form, username: e})}
                        otherStyles="mt-10"
                    />

                    <FormField
                        title="Email"
                        value={form.email}
                        handleChangeText={(e) => setForm({...form, email: e})}
                        otherStyles="mt-7"
                        keyboardType="email-address"
                    />

                    <FormField
                        title="Password"
                        value={form.password}
                        handleChangeText={(e) => setForm({...form, password: e})}
                        otherStyles="mt-7"
                    />

                    <CustomButton
                        title="Sign Up"
                        handlePress={submit}
                        containerStyles="bg-black"
                        isLoading={isSubmitting}
                    />

                    <View className="flex justify-center pt-5 flex-row gap-2">
                        <Text className="text-lg text-gray-100 font-pbold">
                            Have an account already?
                        </Text>
                        <Link
                            href="/sign-in"
                            className="text-lg font-psemibold text-secondary"
                        >
                            Login
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>);
};

export default SignUp;