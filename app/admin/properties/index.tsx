import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { getProperties } from '../../service/property-service';
import { deleteProperty, deleteManyProperties } from '../../service/admin-service';
import { Property } from '../../constants/mock/mock-properties';
import { MaterialIcons } from '@expo/vector-icons';

export default function AdminPropertiesScreen() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const router = useRouter();

    const fetchProperties = async () => {
        setLoading(true);
        const data = await getProperties();
        setProperties(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    const handleSelect = (id: number) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedIds.size === properties.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(properties.map(p => p.id)));
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.size === 0) return;
        
        // Custom simple confirmation for Web/Native since Alert works differently sometimes,
        // but react-native Alert works generally ok in Expo web if polyfilled.
        if (window.confirm(`Are you sure you want to delete ${selectedIds.size} properties?`)) {
            const success = await deleteManyProperties(Array.from(selectedIds));
            if (success) {
                setSelectedIds(new Set());
                fetchProperties();
            } else {
                window.alert('Failed to delete properties. Please try again.');
            }
        }
    };

    const handleDeleteSingle = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this property?')) {
            const success = await deleteProperty(id);
            if (success) {
                fetchProperties();
            } else {
                window.alert('Failed to delete property.');
            }
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#2563eb" />
                <Text className="mt-4 text-gray-500">Loading Properties...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <View className="flex-row justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                <View>
                    <Text className="text-2xl font-bold text-gray-800">Property Listings</Text>
                    <Text className="text-gray-500 text-sm mt-1">Manage your property portfolio</Text>
                </View>
                <View className="flex-row space-x-3">
                    {selectedIds.size > 0 && (
                        <TouchableOpacity 
                            className="bg-red-50 px-4 py-2 rounded-lg flex-row items-center border border-red-200"
                            onPress={handleDeleteSelected}
                        >
                            <MaterialIcons name="delete-outline" size={20} color="#dc2626" />
                            <Text className="text-red-600 font-semibold ml-2">
                                Delete Selected ({selectedIds.size})
                            </Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity 
                        className="bg-blue-600 px-5 py-2.5 rounded-lg flex-row items-center shadow-sm"
                        onPress={() => router.push('/admin/properties/create' as any)}
                    >
                        <MaterialIcons name="add" size={20} color="white" />
                        <Text className="text-white font-bold ml-1">New Property</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView horizontal className="flex-1">
                <ScrollView className="flex-1">
                    <View className="min-w-[1000px] w-full">
                        {/* Table Header */}
                        <View className="flex-row bg-gray-50 border-b border-gray-200 py-4 px-4 items-center">
                            <TouchableOpacity 
                                className="w-12 items-center justify-center"
                                onPress={handleSelectAll}
                            >
                                <MaterialIcons 
                                    name={selectedIds.size === properties.length && properties.length > 0 ? "check-box" : "check-box-outline-blank"} 
                                    size={24} 
                                    color="#6b7280" 
                                />
                            </TouchableOpacity>
                            <Text className="w-16 font-bold text-gray-600 text-sm uppercase tracking-wider">ID</Text>
                            <Text className="w-64 font-bold text-gray-600 text-sm uppercase tracking-wider">Title</Text>
                            <Text className="w-32 font-bold text-gray-600 text-sm uppercase tracking-wider">Type</Text>
                            <Text className="w-32 font-bold text-gray-600 text-sm uppercase tracking-wider">Status</Text>
                            <Text className="w-32 font-bold text-gray-600 text-sm uppercase tracking-wider">Price</Text>
                            <Text className="w-48 font-bold text-gray-600 text-sm uppercase tracking-wider">Location</Text>
                            <Text className="flex-1 font-bold text-gray-600 text-sm uppercase tracking-wider text-right pr-4">Actions</Text>
                        </View>

                        {/* Table Body */}
                        {properties.length === 0 ? (
                            <View className="py-12 items-center justify-center">
                                <MaterialIcons name="inbox" size={48} color="#d1d5db" />
                                <Text className="mt-4 text-gray-500 font-medium">No properties found.</Text>
                            </View>
                        ) : (
                            properties.map((property, index) => (
                                <View 
                                    key={property.id} 
                                    className={`flex-row border-b border-gray-100 py-4 px-4 items-center hover:bg-gray-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                                >
                                    <TouchableOpacity 
                                        className="w-12 items-center justify-center"
                                        onPress={() => handleSelect(property.id)}
                                    >
                                        <MaterialIcons 
                                            name={selectedIds.has(property.id) ? "check-box" : "check-box-outline-blank"} 
                                            size={24} 
                                            color={selectedIds.has(property.id) ? "#2563eb" : "#d1d5db"} 
                                        />
                                    </TouchableOpacity>
                                    
                                    <View className="w-16">
                                        <Text className="text-gray-500 text-sm">#{property.id}</Text>
                                    </View>
                                    
                                    <View className="w-64 pr-4">
                                        <Text className="text-gray-800 font-semibold" numberOfLines={1}>{property.title}</Text>
                                    </View>
                                    
                                    <View className="w-32">
                                        <View className="bg-blue-50 self-start px-2.5 py-1 rounded-md">
                                            <Text className="text-blue-700 text-xs font-semibold capitalize">{property.type.toLowerCase()}</Text>
                                        </View>
                                    </View>

                                    <View className="w-32">
                                        <View className={`self-start px-2.5 py-1 rounded-md ${
                                            property.status.toLowerCase() === 'available' ? 'bg-green-50' : 
                                            property.status.toLowerCase() === 'sold' ? 'bg-red-50' : 'bg-orange-50'
                                        }`}>
                                            <Text className={`text-xs font-semibold capitalize ${
                                                property.status.toLowerCase() === 'available' ? 'text-green-700' : 
                                                property.status.toLowerCase() === 'sold' ? 'text-red-700' : 'text-orange-700'
                                            }`}>
                                                {property.status.toLowerCase()}
                                            </Text>
                                        </View>
                                    </View>
                                    
                                    <View className="w-32">
                                        <Text className="text-gray-700 font-medium font-mono text-sm">
                                            ₱{property.price.toLocaleString()}
                                        </Text>
                                    </View>

                                    <View className="w-48 pr-4">
                                        <Text className="text-gray-500 text-sm" numberOfLines={1}>
                                            {property.location.city}, {property.location.province}
                                        </Text>
                                    </View>
                                    
                                    <View className="flex-1 flex-row justify-end items-center pr-2 space-x-2">
                                        <TouchableOpacity 
                                            className="p-2 hover:bg-gray-100 rounded-full"
                                            onPress={() => router.push(`/admin/properties/edit/${property.id}` as any)}
                                        >
                                            <MaterialIcons name="edit" size={20} color="#4b5563" />
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            className="p-2 hover:bg-red-50 rounded-full"
                                            onPress={() => handleDeleteSingle(property.id)}
                                        >
                                            <MaterialIcons name="delete" size={20} color="#ef4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                </ScrollView>
            </ScrollView>
        </View>
    );
}
