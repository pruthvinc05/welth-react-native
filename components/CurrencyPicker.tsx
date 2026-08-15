import { Feather } from "@expo/vector-icons"
import cc from "currency-codes"
import getSymbol from "currency-symbol-map"
import { useMemo, useState } from "react"
import { FlatList, Modal, Text, TextInput, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export type CurrencyEntry = { code: string, name: string, symbol: string }

export const ALL_CURRENCIES: CurrencyEntry[] = cc
    .codes()
    .map((code) => ({
        code,
        name: cc.code(code)?.currency ?? code,
        symbol: getSymbol(code) ?? code
    }))
    .filter((c) => c.symbol !== c.code) // drop ones with no real symbol

export function CurrencyPicker({ visible, selectedCode, onSelect, onClose }: {
    visible: boolean
    selectedCode: string
    onSelect: (currency: CurrencyEntry) => void
    onClose: () => void
}) {
    const [search, setSearch] = useState("")

    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        if (!q) return ALL_CURRENCIES
        return ALL_CURRENCIES.filter((c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q))
    }, [search])

    // older UI
    // return (
    //     <Modal
    //         visible={visible}
    //         animationType="slide"
    //         presentationStyle="pageSheet"
    //     >
    //         <SafeAreaView className="flex-1 bg-brand-body " edges={["top"]}>
    //             <View className="flex-row items-center px-5 pt-3 pb-2 gap-3">
    //                 <TextInput
    //                     value={search}
    //                     onChangeText={setSearch}
    //                     placeholder="Search currency..."
    //                     placeholderTextColor={"#8A8D96"}
    //                     autoFocus
    //                     className="flex-1 bg-white border border-[#E8E6DF] rounded-full px-4 py-2.5 text-sm text-brand-bg"
    //                 />
    //                 <TouchableOpacity
    //                     onPress={() => {
    //                         setSearch("")
    //                         onClose()
    //                     }}
    //                 >
    //                     <Text className="text-brand-text-secondary text-sm">Cancel</Text>
    //                 </TouchableOpacity>
    //             </View>

    //             <FlatList
    //                 data={filtered}
    //                 keyExtractor={(item) => item.code}
    //                 keyboardShouldPersistTaps="handled"
    //                 renderItem={({ item }) => (
    //                     <TouchableOpacity
    //                         onPress={() => {
    //                             onSelect(item)
    //                             setSearch("")
    //                         }}
    //                         className="flex-row items-center px-5 py-3.5 border-b border-[#F0EDE6]"
    //                     >
    //                         <Text className="text-brand-text-secondary w-8 text-sm">
    //                             {item.symbol}
    //                         </Text>
    //                         <Text className="text-brand-bg text-sm font-medium w-12">
    //                             {item.code}
    //                         </Text>
    //                         <Text className="text-brand-text-secondary text-sm flex-1" numberOfLines={1}>
    //                             {item.name}
    //                         </Text>
    //                         {item.code === selectedCode && (
    //                             <Feather name="check" size={16} color={"#4A9EFF"} />
    //                         )}
    //                     </TouchableOpacity>
    //                 )}
    //             />
    //         </SafeAreaView>
    //     </Modal>
    // )

    // updated UI
    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <SafeAreaView
                className="flex-1 bg-brand-body"
                edges={["top"]}
            >
                {/* Header */}
                <View className="px-5 pt-5 pb-4">
                    <View className="flex-row items-center gap-3">
                        {/* Search */}
                        <View className="flex-1 flex-row items-center bg-white border border-[#E8E6DF] rounded-2xl px-4 h-12 shadow-sm">
                            <View className="w-7 h-7 rounded-full bg-[#F5F7FA] items-center justify-center">
                                <Feather
                                    name="search"
                                    size={15}
                                    color="#6F7480"
                                />
                            </View>

                            <TextInput
                                value={search}
                                onChangeText={setSearch}
                                placeholder="Search currency..."
                                placeholderTextColor="#9A9DA5"
                                autoFocus
                                className="flex-1 ml-2.5 text-sm text-brand-bg"
                            />

                            {search.length > 0 && (
                                <TouchableOpacity
                                    onPress={() => setSearch("")}
                                    activeOpacity={0.7}
                                    className="w-7 h-7 rounded-full bg-[#F1F1EF] items-center justify-center"
                                >
                                    <Feather
                                        name="x"
                                        size={14}
                                        color="#777B84"
                                    />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Cancel */}
                        <TouchableOpacity
                            onPress={() => {
                                setSearch("")
                                onClose()
                            }}
                            activeOpacity={0.7}
                            className="h-12 px-1 items-center justify-center"
                        >
                            <Text className="text-brand-bg text-sm font-semibold">
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Heading */}
                    <View className="mt-3">
                        <View className="flex-row items-center justify-between">
                            <View>
                                <Text className="text-brand-bg text-2xl font-bold tracking-tight">
                                    Select Currency
                                </Text>

                                <Text className="text-brand-text-secondary text-xs mt-0.5">
                                    Choose your preferred currency
                                </Text>
                            </View>

                            {/* Small decorative icon */}
                            <View className="w-11 h-11 rounded-2xl bg-[#EAF4FF] items-center justify-center">
                                <Feather
                                    name="globe"
                                    size={19}
                                    color="#4A9EFF"
                                />
                            </View>
                        </View>
                    </View>
                </View>

                {/* List */}
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.code}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingTop: 0,
                        paddingBottom: 0,
                    }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => {
                                onSelect(item)
                                setSearch("")
                            }}
                            activeOpacity={0.75}
                            className={`flex-row items-center mx-5 mb-2.5 px-4 py-3.5 rounded-2xl border ${item.code === selectedCode
                                ? "bg-[#F1F8FF] border-[#A9D2FF]"
                                : "bg-white border-[#E8E6DF]"
                                }`}
                        >
                            {/* Currency Symbol */}
                            <View
                                className={`w-12 h-12 rounded-2xl items-center justify-center ${item.code === selectedCode
                                    ? "bg-[#DCEEFF]"
                                    : "bg-[#F6F5F2]"
                                    }`}
                            >
                                <Text
                                    className={`text-lg font-bold ${item.code === selectedCode
                                        ? "text-[#4A9EFF]"
                                        : "text-[#60636B]"
                                        }`}
                                >
                                    {item.symbol}
                                </Text>
                            </View>

                            {/* Currency Information */}
                            <View className="ml-3.5 flex-1">
                                <View className="flex-row items-center">
                                    <Text className="text-brand-bg text-[15px] font-bold">
                                        {item.code}
                                    </Text>

                                    {item.code === selectedCode && (
                                        <View className="ml-2 px-2 py-0.5 rounded-full bg-[#DCEEFF]">
                                            <Text className="text-[#4A9EFF] text-[9px] font-bold uppercase">
                                                Selected
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <Text
                                    className="text-brand-text-secondary text-xs mt-1"
                                    numberOfLines={1}
                                >
                                    {item.name}
                                </Text>
                            </View>

                            {/* Check */}
                            {item.code === selectedCode && (
                                <View className="w-8 h-8 rounded-full bg-[#4A9EFF] items-center justify-center shadow-sm">
                                    <Feather
                                        name="check"
                                        size={16}
                                        color="#FFFFFF"
                                    />
                                </View>
                            )}

                            {/* Arrow for unselected currencies */}
                            {item.code !== selectedCode && (
                                <Feather
                                    name="chevron-right"
                                    size={17}
                                    color="#C4C6CA"
                                />
                            )}
                        </TouchableOpacity>
                    )}
                />
            </SafeAreaView>
        </Modal>
    )
}