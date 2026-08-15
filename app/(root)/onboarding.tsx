import { ALL_CURRENCIES, CurrencyPicker } from '@/components/CurrencyPicker'
import { useSupabase } from '@/hooks/useSupabase'
import { OnboardingFormValues, onboardingSchema } from '@/lib/schemas/onboarding'
import { useUserStore } from '@/store/userStore'
import { useUser } from '@clerk/expo'
import { Feather } from '@expo/vector-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function OnboardingScreen() {
    const { user } = useUser()
    const router = useRouter()
    const setCurrency = useUserStore((s) => s.setCurrency)
    const setNeedsOnboarding = useUserStore((s) => s.setNeedsOnboarding)

    const { control,
        handleSubmit,
        formState: { errors: formErrors }
    } = useForm<OnboardingFormValues>({
        resolver: zodResolver(onboardingSchema),
        mode: "onBlur",
        defaultValues: { startingBalance: "" }
    })

    const [selectedCurrency, setSelectedCurrency] = useState(
        ALL_CURRENCIES.find((c) => c.code === "INR") ?? ALL_CURRENCIES[0]
    )
    const [pickerOpen, setPickerOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")

    const authSupabase = useSupabase()

    const handleSave = async ({ startingBalance }: OnboardingFormValues) => {
        const parsed = parseFloat(startingBalance.replace(/,/g, ""))
        setSaving(true)
        setError("")

        const { error: updateError } = await authSupabase
            .from("users")
            .update({
                currency: selectedCurrency.code
            })
            .eq("clerk_id", user!.id)

        if (updateError) {
            setSaving(false)
            setError("Something went wrong. Please try again")
            return
        }

        const { data: defaultAccount, error: accountFetchError } = await authSupabase
            .from("accounts")
            .select("id, balance")
            .eq("user_id", user!.id)
            .eq("is_default", true)
            .single()

        if (accountFetchError || !defaultAccount) {
            setSaving(false)
            setError("Something went wrong. Please try again")
            return
        }

        const { error: txError } = await authSupabase
            .from("transactions")
            .insert({
                user_id: user!.id,
                account_id: defaultAccount.id,
                type: "INCOME",
                amount: parsed,
                category: "other_income",
                description: "Starting balance",
                date: new Date().toISOString(),
                input_method: "MANUAL"
            })

        if (txError) {
            setSaving(false)
            setError("Something went wrong. Please try again")
            return
        }

        const { error: balanceError } = await authSupabase
            .from("accounts")
            .update({ balance: defaultAccount.balance + parsed })
            .eq("id", defaultAccount.id)

        setSaving(false)

        if (balanceError) {
            setError("Something went wrong. Please try again")
            return
        }

        setCurrency(selectedCurrency.code)
        setNeedsOnboarding(false)
        router.replace("/(root)/(tabs)")
    }

    // older UI
    // return (
    //     <SafeAreaView className='flex-1 bg-brand-body' edges={["top"]}>
    //         <KeyboardAvoidingView
    //             behavior={Platform.OS === "ios" ? "padding" : "height"}
    //             // className='flex-1 bg-brand-body'
    //             style={{ flex: 1 }}
    //         >
    //             <View className='flex-1 justify-center px-6 -mt-16'>
    //                 <Image
    //                     source={require("../../assets/images/welth.png")}
    //                     className='w-36 h-16 mb-4'
    //                     resizeMode='contain'
    //                 />
    //                 <Text className='text-3xl font-bold text-[#1A1D26] mb-1'>
    //                     Let&apos;s get you set up
    //                 </Text>
    //                 <Text className='text-brand-text-muted text-base mb-3'>
    //                     A couple of quick details to personalise your experience.
    //                 </Text>

    //                 <Text className='text-brand-bg text-xs font-medium mb-1.5'>
    //                     Starting balance
    //                 </Text>

    //                 <View className='flex-row items-center bg-white border border-[#E8E6DF] rounded-xl px-4 mb-1'>
    //                     <Text className='text-brand-text-secondary text-lg mr-2'>
    //                         {selectedCurrency.symbol}
    //                     </Text>
    //                     <Controller
    //                         control={control}
    //                         name='startingBalance'
    //                         render={({ field: { value, onChange } }) => {
    //                             return (
    //                                 <TextInput
    //                                     className={"flex-1 py-3.5 text-sm text-brand-bg"}
    //                                     placeholder='e.g. 50000'
    //                                     placeholderTextColor={"#8A8D96"}
    //                                     keyboardType='numeric'
    //                                     returnKeyType='done'
    //                                     value={value}
    //                                     onChangeText={(v) => {
    //                                         setError("")
    //                                         onChange(v)
    //                                     }}
    //                                 />
    //                             )
    //                         }}
    //                     />
    //                 </View>
    //                 {formErrors.startingBalance && (
    //                     <Text className='text-brand-coral mb-2 text-sm'>
    //                         {formErrors.startingBalance?.message}
    //                     </Text>
    //                 )}
    //                 <View className='mb-3' />

    //                 {/* Currency Picker */}
    //                 <Text className='text-brand-bg text-xs font-medium mb-1.5'>
    //                     Currency
    //                 </Text>
    //                 <TouchableOpacity
    //                     onPress={() => setPickerOpen(true)}
    //                     className='flex-row items-center justify-between bg-white border border-[#E8E6DF] rounded-xl px-4 py-3.5 mb-6'
    //                 >
    //                     <Text className='text-sm text-brand-bg'>
    //                         {selectedCurrency.symbol} {selectedCurrency.code} --{" "}{selectedCurrency.name}
    //                     </Text>
    //                     <Feather name='chevron-down' size={16} color={"#8A8D96"} />
    //                 </TouchableOpacity>

    //                 {error ? (
    //                     <Text className='text-brand-coral text-xs mb-2'>{error}</Text>
    //                 ) : null}



    //                 <TouchableOpacity
    //                     className='bg-brand-bg py-4 rounded-xl items-center'
    //                     disabled={saving}
    //                     onPress={handleSubmit(handleSave)}
    //                     activeOpacity={0.85}
    //                 >
    //                     <Text className='text-white text-sm font-semibold'>
    //                         {saving ? "Saving..." : "Get Started"}
    //                     </Text>
    //                 </TouchableOpacity>
    //             </View>
    //         </KeyboardAvoidingView>
    //     </SafeAreaView>
    // )

    // updated UI
    return (
        <SafeAreaView className="flex-1 bg-brand-body" edges={["top"]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <View className="flex-1 justify-center px-6 py-8">

                    {/* Header Section */}
                    <View className="mb-5">
                        <View className="inline-flex self-start bg-brand-bg/10 px-3 py-1 rounded-full mb-3">
                            <Text className="text-xs font-semibold text-brand-bg uppercase tracking-wider">
                                Quick Setup
                            </Text>
                        </View>
                        <Text className="text-3xl font-extrabold text-[#1A1D26] tracking-tight mb-1">
                            Let&apos;s get you set up
                        </Text>
                        <Text className="text-brand-text-muted text-base leading-relaxed">
                            A couple of quick details to personalize your financial experience.
                        </Text>
                    </View>

                    {/* Form Card Container */}
                    <View className="bg-white rounded-2xl p-5 border border-[#E8E6DF] shadow-sm mb-6">

                        {/* Starting Balance Input */}
                        <View className="mb-4">
                            <Text className="text-brand-bg text-xs font-semibold uppercase tracking-wider mb-2">
                                Starting Balance
                            </Text>
                            <View className="flex-row items-center bg-[#F9F9F8] border border-[#E8E6DF] rounded-xl px-4 focus:border-brand-bg">
                                <Text className="text-brand-text-secondary font-bold text-base mr-2">
                                    {selectedCurrency.symbol}
                                </Text>
                                <Controller
                                    control={control}
                                    name="startingBalance"
                                    render={({ field: { value, onChange } }) => (
                                        <TextInput
                                            className="flex-1 py-3.5 text-base text-brand-bg font-medium"
                                            placeholder="e.g. 50,000"
                                            placeholderTextColor="#8A8D96"
                                            keyboardType="numeric"
                                            returnKeyType="done"
                                            value={value}
                                            onChangeText={(v) => {
                                                setError("");
                                                onChange(v);
                                            }}
                                        />
                                    )}
                                />
                            </View>
                            {formErrors.startingBalance && (
                                <Text className="text-brand-coral mt-1.5 text-xs font-medium">
                                    {formErrors.startingBalance?.message}
                                </Text>
                            )}
                        </View>

                        {/* Currency Picker */}
                        <View className="mb-2">
                            <Text className="text-brand-bg text-xs font-semibold uppercase tracking-wider mb-2">
                                Currency
                            </Text>
                            <TouchableOpacity
                                onPress={() => setPickerOpen(true)}
                                activeOpacity={0.7}
                                className="flex-row items-center justify-between bg-[#F9F9F8] border border-[#E8E6DF] rounded-xl px-4 py-3.5"
                            >
                                <Text className="text-sm font-medium text-brand-bg">
                                    {selectedCurrency.symbol} {selectedCurrency.code} — {selectedCurrency.name}
                                </Text>
                                <Feather name="chevron-down" size={18} color="#8A8D96" />
                            </TouchableOpacity>
                        </View>

                        {/* General Form Error */}
                        {error ? (
                            <Text className="text-brand-coral text-xs font-medium mt-2">
                                {error}
                            </Text>
                        ) : null}
                    </View>

                    {/* Primary Action Button */}
                    <TouchableOpacity
                        className={`bg-brand-bg py-4 rounded-xl flex-row items-center justify-center space-x-2 ${saving ? "opacity-70" : "opacity-100"
                            }`}
                        disabled={saving}
                        onPress={handleSubmit(handleSave)}
                        activeOpacity={0.85}
                    >
                        <Text className="text-white text-base font-semibold">
                            {saving ? "Saving Setup..." : "Get Started"}
                        </Text>
                        {!saving && (
                            <Feather name="arrow-right" size={18} color="#FFFFFF" className="ml-1" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            <CurrencyPicker
                visible={pickerOpen}
                selectedCode={selectedCurrency.code}
                onSelect={(currency) => {
                    setSelectedCurrency(currency)
                    setPickerOpen(false)
                }}
                onClose={() => setPickerOpen(false)}
            />
        </SafeAreaView>
    );
}