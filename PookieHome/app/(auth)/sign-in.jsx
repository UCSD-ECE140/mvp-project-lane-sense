import {View, Text, ScrollView} from 'react-native';
import {useState} from 'react';
import {SafeAreaView} from "react-native-safe-area-context";
import {Link} from "expo-router"

import FormField from "../../components/FormField";
import CustomButton from "../../components/Custom Button";

const SignIn = () => {
    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const submit = () => {
    }


    return (
        <SafeAreaView className={"bg-amber-300 h-full"}>
            <ScrollView>
                <View className="w-full justify-center h-full px-4">
                    <Text className={"text-3xl font-pbold text-blue-800"}>Log In to Pookie:</Text>

                    <FormField
                        title="Email"
                        value={form.email}
                        handleChangeText={(e) => setForm({ ...form, email: e })}
                        otherStyles="mt-7"
                        keyboardType="email-address"
                    />

                    <FormField
                        title="Password"
                        value={form.password}
                        handleChangeText={(e) => setForm({ ...form, password: e })}
                        otherStyles="mt-7"
                    />

                    <CustomButton
                        title="Sign In"
                        handlePress={submit}
                        containerStyles="bg-pastel-blue mt-7"
                        textStyles="text-white"
                        isLoading={isSubmitting}
                    />

                    <View className={"justify-center pt-5 flex-row gap-2"}>
                        <Text className="text-lg text-black">
                            Don't have an account?
                        </Text>
                        <Link href="/sign-up" className="text-lg text-blue-950 font-semibold ">Sign Up</Link>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default SignIn;