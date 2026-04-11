import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState, useMemo } from 'react';
import { getProperties } from '../../service/property-service';
import { deleteProperty, deleteManyProperties } from '../../service/admin-service';
import { Property } from '../../constants/mock/mock-properties';
import { MaterialIcons } from '@expo/vector-icons';

type SortField = 'id' | 'title' | 'type' | 'status' | 'price' | 'lotArea' | 'city';
type SortOrder = 'asc' | 'desc';

export default function AdminPropertiesScreen() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading]       = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [sortField, setSortField]   = useState<SortField>('id');
    const [sortOrder, setSortOrder]   = useState<SortOrder>('asc');
    const router = useRouter();

    const fetchProperties = useCallback(async () => {
        setLoading(true);
        const data = await getProperties();
        setProperties(data || []);
        setLoading(false);
    }, []);

    useFocusEffect(
        useCallback(() => { fetchProperties(); }, [fetchProperties])
    );

   // Fields where ↑ (asc state) should actually sort descending (highest first)
    const INVERTED_FIELDS: SortField[] = ['price', 'lotArea'];

    // sorting
    const sorted = useMemo(() => {
        return [...properties].sort((a, b) => {
            let av: any;
            let bv: any;
            switch (sortField) {
                case 'id':      av = a.id;              bv = b.id;              break;
                case 'title':   av = a.title;           bv = b.title;           break;
                case 'type':    av = a.type;            bv = b.type;            break;
                case 'status':  av = a.status;          bv = b.status;          break;
                case 'price':   av = a.price;           bv = b.price;           break;
                case 'lotArea': av = a.lotArea ?? 0;    bv = b.lotArea ?? 0;    break;
                case 'city':    av = a.location?.city;  bv = b.location?.city;  break;
                default:        av = a.id;              bv = b.id;
            }
            // For inverted fields: asc state → desc sort (highest first)
            const effectiveOrder = INVERTED_FIELDS.includes(sortField)
                ? (sortOrder === 'asc' ? 'desc' : 'asc')
                : sortOrder;
            if (typeof av === 'string') {
                return effectiveOrder === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
            }
            return effectiveOrder === 'asc' ? av - bv : bv - av;
        });
    }, [properties, sortField, sortOrder]);

    const handleHeaderPress = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) {
            return <MaterialIcons name="unfold-more" size={14} color="#9ca3af" style={{ marginLeft: 2 }} />;
        }
        return (
            <MaterialIcons
                name={sortOrder === 'asc' ? 'arrow-upward' : 'arrow-downward'}
                size={14}
                color="#2563eb"
                style={{ marginLeft: 2 }}
            />
        );
    };

    const ColHeader = ({ label, field, width }: { label: string; field: SortField; width: number }) => (
        <TouchableOpacity
            onPress={() => handleHeaderPress(field)}
            style={{ width, flexDirection: 'row', alignItems: 'center' }}
            className="py-1"
        >
            <Text
                className={`font-bold text-xs uppercase tracking-wider ${
                    sortField === field ? 'text-blue-600' : 'text-gray-500'
                }`}
            >
                {label}
            </Text>
            <SortIcon field={field} />
        </TouchableOpacity>
    );

    // ── Selection helpers ──────────────────────────────────────────────────
    const handleSelect = (id: number) => {
        const next = new Set(selectedIds);
        next.has(id) ? next.delete(id) : next.add(id);
        setSelectedIds(next);
    };

    const handleSelectAll = () => {
        setSelectedIds(
            selectedIds.size === properties.length
                ? new Set()
                : new Set(properties.map(p => p.id))
        );
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.size === 0) return;
        if (window.confirm(`Delete ${selectedIds.size} propert${selectedIds.size === 1 ? 'y' : 'ies'}?`)) {
            const ok = await deleteManyProperties(Array.from(selectedIds));
            if (ok) { setSelectedIds(new Set()); fetchProperties(); }
            else window.alert('Failed to delete. Please try again.');
        }
    };

    const handleDeleteSingle = async (id: number) => {
        if (window.confirm('Delete this property?')) {
            const ok = await deleteProperty(id);
            if (ok) fetchProperties();
            else window.alert('Failed to delete.');
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
            {/* Header bar */}
            <View className="flex-row justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                <View>
                    <Text className="text-2xl font-bold text-gray-800">Property Listings</Text>
                    <Text className="text-gray-500 text-sm mt-1">
                        {properties.length} propert{properties.length === 1 ? 'y' : 'ies'} · sorted by{' '}
                        <Text className="text-blue-600 font-medium">{sortField}</Text>{' '}
                        ({sortOrder === 'asc' ? '↑' : '↓'})
                    </Text>
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

            <ScrollView horizontal className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
                <ScrollView className="flex-1">
                    <View className="flex-1 min-w-full">

                        {/* Table Header */}
                        <View className="flex-row bg-gray-50 border-b border-gray-200 py-3 px-4 items-center">
                            <TouchableOpacity
                                className="w-12 items-center justify-center"
                                onPress={handleSelectAll}
                            >
                                <MaterialIcons
                                    name={selectedIds.size === properties.length && properties.length > 0
                                        ? "check-box" : "check-box-outline-blank"}
                                    size={24} color="#6b7280"
                                />
                            </TouchableOpacity>

                            <ColHeader label="ID"       field="id"      width={64} />
                            <ColHeader label="Title"    field="title"   width={256} />
                            <ColHeader label="Type"     field="type"    width={128} />
                            <ColHeader label="Status"   field="status"  width={128} />
                            <ColHeader label="Price"    field="price"   width={128} />
                            <ColHeader label="Lot Area" field="lotArea" width={110} />
                            <ColHeader label="Location" field="city"    width={192} />

                            <Text className="flex-1 font-bold text-gray-500 text-xs uppercase tracking-wider text-right pr-2">
                                Actions
                            </Text>
                        </View>

                        {/* Table Body */}
                        {sorted.length === 0 ? (
                            <View className="py-12 items-center justify-center">
                                <MaterialIcons name="inbox" size={48} color="#d1d5db" />
                                <Text className="mt-4 text-gray-500 font-medium">No properties found.</Text>
                            </View>
                        ) : (
                            sorted.map((property, index) => (
                                <View
                                    key={property.id}
                                    className={`flex-row border-b border-gray-100 py-4 px-4 items-center ${
                                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                                    }`}
                                >
                                    {/* Checkbox */}
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

                                    {/* ID */}
                                    <View style={{ width: 64 }}>
                                        <Text className="text-gray-400 text-sm">#{property.id}</Text>
                                    </View>

                                    {/* Title */}
                                    <View style={{ width: 256 }} className="pr-4">
                                        <Text className="text-gray-800 font-semibold" numberOfLines={1}>
                                            {property.title}
                                        </Text>
                                    </View>

                                    {/* Type */}
                                    <View style={{ width: 128 }}>
                                        <View className="bg-blue-50 self-start px-2.5 py-1 rounded-md">
                                            <Text className="text-blue-700 text-xs font-semibold capitalize">
                                                {property.type?.toLowerCase()}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Status */}
                                    <View style={{ width: 128 }}>
                                        <View className={`self-start px-2.5 py-1 rounded-md ${
                                            property.status?.toLowerCase() === 'available' ? 'bg-green-50' :
                                            property.status?.toLowerCase() === 'sold'      ? 'bg-red-50' : 'bg-orange-50'
                                        }`}>
                                            <Text className={`text-xs font-semibold capitalize ${
                                                property.status?.toLowerCase() === 'available' ? 'text-green-700' :
                                                property.status?.toLowerCase() === 'sold'      ? 'text-red-700' : 'text-orange-700'
                                            }`}>
                                                {property.status?.toLowerCase()}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Price */}
                                    <View style={{ width: 128 }}>
                                        <Text className="text-gray-700 font-medium font-mono text-sm">
                                            ₱{property.price?.toLocaleString()}
                                        </Text>
                                    </View>

                                    {/* Lot Area */}
                                    <View style={{ width: 110 }}>
                                        <Text className="text-gray-500 text-sm font-mono">
                                            {property.lotArea != null ? `${property.lotArea.toLocaleString()} m²` : '—'}
                                        </Text>
                                    </View>

                                    {/* Location */}
                                    <View style={{ width: 192 }} className="pr-4">
                                        <Text className="text-gray-500 text-sm" numberOfLines={1}>
                                            {property.location?.city}, {property.location?.province}
                                        </Text>
                                    </View>

                                    {/* Actions */}
                                    <View className="flex-1 flex-row justify-end items-center pr-2 space-x-2">
                                        <TouchableOpacity
                                            className="p-2 rounded-full"
                                            onPress={() => router.push(`/admin/properties/edit/${property.id}` as any)}
                                        >
                                            <MaterialIcons name="edit" size={20} color="#4b5563" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            className="p-2 rounded-full"
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
