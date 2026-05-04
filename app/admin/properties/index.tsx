import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, Pressable, type ViewStyle } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState, useMemo, useEffect } from 'react';
import { getProperties } from '../../service/property-service';
import { deleteProperty, deleteManyProperties } from '../../service/admin-service';
import { Property } from '../../constants/mock/mock-properties';
import { MaterialIcons } from '@expo/vector-icons';

type SortField = 'id' | 'title' | 'type' | 'status' | 'price' | 'lotArea' | 'city';
type SortOrder = 'asc' | 'desc';

// Fields where ↑ (asc state) should actually sort descending (highest first)
const INVERTED_FIELDS: SortField[] = ['price', 'lotArea'];

export default function AdminPropertiesScreen() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading]       = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [sortField, setSortField]   = useState<SortField>('id');
    const [sortOrder, setSortOrder]   = useState<SortOrder>('asc');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const router = useRouter();

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchProperties = useCallback(async () => {
        setLoading(true);
        const data = await getProperties();
        setProperties(data || []);
        setLoading(false);
    }, []);

    useFocusEffect(
        useCallback(() => { fetchProperties(); }, [fetchProperties])
    );

    // Filter then sort — debouncedSearch is included in deps
    const sorted = useMemo(() => {
        let list = [...properties];

        if (debouncedSearch) {
            const q = debouncedSearch.toLowerCase();
            list = list.filter(p =>
                p.title?.toLowerCase().includes(q) ||
                p.location?.city?.toLowerCase().includes(q) ||
                p.location?.province?.toLowerCase().includes(q) ||
                String(p.id).includes(q) ||
                p.type?.toLowerCase().includes(q) ||
                p.status?.toLowerCase().includes(q)
            );
        }

        return list.sort((a, b) => {
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
            const effectiveOrder = INVERTED_FIELDS.includes(sortField)
                ? (sortOrder === 'asc' ? 'desc' : 'asc')
                : sortOrder;
            if (typeof av === 'string') {
                return effectiveOrder === 'asc' ? av.localeCompare(bv ?? '') : (bv ?? '').localeCompare(av);
            }
            return effectiveOrder === 'asc' ? (av ?? 0) - (bv ?? 0) : (bv ?? 0) - (av ?? 0);
        });
    }, [properties, sortField, sortOrder, debouncedSearch]);

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

    const ColHeader = ({ label, field, style }: { label: string; field: SortField; style?: ViewStyle }) => (
        <TouchableOpacity
            onPress={() => handleHeaderPress(field)}
            style={[{ flexDirection: 'row', alignItems: 'center' }, style]}
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
            selectedIds.size === sorted.length && sorted.length > 0
                ? new Set()
                : new Set(sorted.map(p => p.id))
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

    /** Fixed / flex column styles — row is `width: '100%'` so the table fits the container (no horizontal scroll). */
    const col = {
        check: { width: 48 } as ViewStyle,
        id: { width: 52 } as ViewStyle,
        title: { flex: 2, minWidth: 140, flexShrink: 1, paddingRight: 8 } as ViewStyle,
        type: { width: 92, flexShrink: 0 } as ViewStyle,
        status: { width: 104, flexShrink: 0 } as ViewStyle,
        price: { width: 118, flexShrink: 0 } as ViewStyle,
        lot: { width: 84, flexShrink: 0 } as ViewStyle,
        location: { flex: 1.25, minWidth: 120, flexShrink: 1, paddingRight: 8 } as ViewStyle,
        actions: { width: 168, flexShrink: 0 } as ViewStyle,
    };

    return (
        <View
            className="flex-1 bg-white rounded-2xl overflow-hidden border border-slate-200/80 w-full"
            style={{
                shadowColor: '#0f172a',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.06,
                shadowRadius: 16,
                elevation: 3,
            }}
        >
            {/* Header bar */}
            <View className="flex-row flex-wrap justify-between items-start gap-4 p-6 border-b border-slate-100 bg-slate-50">
                <View className="flex-row items-start" style={{ gap: 14 }}>
                    <View className="w-11 h-11 rounded-xl bg-blue-600/10 items-center justify-center border border-blue-100">
                        <MaterialIcons name="table-chart" size={22} color="#2563eb" />
                    </View>
                    <View>
                        <Text className="text-2xl font-bold text-slate-900 tracking-tight">Property listings</Text>
                        <Text className="text-slate-500 text-sm mt-1 leading-5">
                            Showing <Text className="text-slate-800 font-semibold">{sorted.length}</Text> of{' '}
                            <Text className="text-slate-800 font-semibold">{properties.length}</Text>
                        </Text>
                    </View>
                </View>

                <View className="flex-row flex-wrap items-center justify-end" style={{ gap: 10 }}>
                    <View
                        className="flex-row items-center bg-white border border-slate-200 rounded-xl px-3.5"
                        style={{ minWidth: 220, maxWidth: 320, height: 42 }}
                    >
                        <MaterialIcons name="search" size={20} color="#94a3b8" />
                        <TextInput
                            placeholder="Search title, city, ID…"
                            placeholderTextColor="#94a3b8"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            style={{
                                flex: 1,
                                marginLeft: 10,
                                fontSize: 14,
                                color: '#0f172a',
                                height: 42,
                                outlineStyle: 'none',
                            } as any}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity
                                onPress={() => {
                                    setSearchQuery('');
                                    setDebouncedSearch('');
                                }}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <MaterialIcons name="close" size={18} color="#94a3b8" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {selectedIds.size > 0 && (
                        <TouchableOpacity
                            className="bg-red-50 px-4 py-2.5 rounded-xl flex-row items-center border border-red-200/80"
                            onPress={handleDeleteSelected}
                        >
                            <MaterialIcons name="delete-outline" size={20} color="#dc2626" />
                            <Text className="text-red-700 font-semibold ml-2">Delete ({selectedIds.size})</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        className="bg-blue-600 px-5 py-2.5 rounded-xl flex-row items-center"
                        style={{
                            shadowColor: '#2563eb',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.35,
                            shadowRadius: 6,
                            elevation: 4,
                        }}
                        onPress={() => router.push('/admin/properties/create' as any)}
                    >
                        <MaterialIcons name="add" size={22} color="white" />
                        <Text className="text-white font-bold ml-1.5">New property</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                className="flex-1 w-full"
                style={{ minHeight: 0 }}
                stickyHeaderIndices={[0]}
                contentContainerStyle={{ flexGrow: 1, width: '100%' }}
            >
                    {/* Sticky table header (index 0) */}
                    <View
                        className="flex-row bg-slate-100 border-b border-slate-200 py-3.5 px-3 sm:px-4 items-center w-full"
                        style={{ width: '100%' }}
                    >
                        <TouchableOpacity
                            style={col.check}
                            className="items-center justify-center"
                            onPress={handleSelectAll}
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                            <MaterialIcons
                                name={
                                    selectedIds.size === sorted.length && sorted.length > 0
                                        ? 'check-box'
                                        : 'check-box-outline-blank'
                                }
                                size={22}
                                color="#64748b"
                            />
                        </TouchableOpacity>

                        <ColHeader label="ID" field="id" style={col.id} />
                        <ColHeader label="Title" field="title" style={col.title} />
                        <ColHeader label="Type" field="type" style={col.type} />
                        <ColHeader label="Status" field="status" style={col.status} />
                        <ColHeader label="Price" field="price" style={col.price} />
                        <ColHeader label="Lot" field="lotArea" style={col.lot} />
                        <ColHeader label="Location" field="city" style={col.location} />

                        <View style={col.actions} className="items-center">
                            <Text className="font-bold text-slate-500 text-xs uppercase tracking-wider">Actions</Text>
                        </View>
                    </View>

                    {sorted.length === 0 ? (
                        <View className="py-16 items-center justify-center px-6 w-full">
                            <View className="w-16 h-16 rounded-2xl bg-slate-100 items-center justify-center mb-4">
                                <MaterialIcons name="search-off" size={36} color="#cbd5e1" />
                            </View>
                            <Text className="text-slate-600 font-semibold text-base text-center">
                                {debouncedSearch ? `No matches for "${debouncedSearch}"` : 'No properties yet'}
                            </Text>
                            <Text className="text-slate-400 text-sm mt-2 text-center max-w-md">
                                {debouncedSearch
                                    ? 'Try a different keyword or clear the search filter.'
                                    : 'Create a listing with the New property button above.'}
                            </Text>
                        </View>
                    ) : (
                        sorted.map((property, index) => (
                            <Pressable
                                key={property.id}
                                style={({ hovered }) => ({
                                    width: '100%',
                                    backgroundColor: hovered ? '#f8fafc' : index % 2 === 0 ? '#ffffff' : '#fafafa',
                                })}
                                className="flex-row border-b border-slate-100 py-3.5 px-3 sm:px-4 items-center"
                            >
                                <TouchableOpacity
                                    style={col.check}
                                    className="items-center justify-center"
                                    onPress={() => handleSelect(property.id)}
                                >
                                    <MaterialIcons
                                        name={selectedIds.has(property.id) ? 'check-box' : 'check-box-outline-blank'}
                                        size={22}
                                        color={selectedIds.has(property.id) ? '#2563eb' : '#cbd5e1'}
                                    />
                                </TouchableOpacity>

                                <View style={col.id}>
                                    <Text className="text-slate-400 text-xs font-medium uppercase tracking-wide">
                                        #{property.id}
                                    </Text>
                                </View>

                                <View style={col.title}>
                                    <Text className="text-slate-900 font-semibold text-[15px]" numberOfLines={1}>
                                        {property.title}
                                    </Text>
                                </View>

                                <View style={col.type}>
                                    <View className="bg-sky-50 self-start px-2.5 py-1 rounded-lg border border-sky-100">
                                        <Text className="text-sky-800 text-xs font-bold capitalize tracking-wide">
                                            {property.type?.toLowerCase()}
                                        </Text>
                                    </View>
                                </View>

                                <View style={col.status}>
                                    <View
                                        className={`self-start px-2.5 py-1 rounded-lg border ${
                                            property.status?.toLowerCase() === 'available'
                                                ? 'bg-emerald-50 border-emerald-100'
                                                : property.status?.toLowerCase() === 'sold'
                                                  ? 'bg-rose-50 border-rose-100'
                                                  : 'bg-amber-50 border-amber-100'
                                        }`}
                                    >
                                        <Text
                                            className={`text-xs font-bold capitalize ${
                                                property.status?.toLowerCase() === 'available'
                                                    ? 'text-emerald-800'
                                                    : property.status?.toLowerCase() === 'sold'
                                                      ? 'text-rose-800'
                                                      : 'text-amber-900'
                                            }`}
                                        >
                                            {property.status?.toLowerCase()}
                                        </Text>
                                    </View>
                                </View>

                                <View style={col.price}>
                                    <Text className="text-slate-800 font-semibold font-mono text-sm">
                                        ₱{property.price?.toLocaleString()}
                                    </Text>
                                </View>

                                <View style={col.lot}>
                                    <Text className="text-slate-500 text-sm font-mono">
                                        {property.lotArea != null ? `${property.lotArea.toLocaleString()} m²` : '—'}
                                    </Text>
                                </View>

                                <View style={col.location}>
                                    <Text className="text-slate-500 text-sm" numberOfLines={1}>
                                        {property.location?.city}, {property.location?.province}
                                    </Text>
                                </View>

                                <View className="flex-row justify-center items-center" style={{ ...col.actions, gap: 6 }}>
                                    <TouchableOpacity
                                        className="flex-row items-center bg-slate-100 border border-slate-200/80 px-3 py-2 rounded-lg"
                                        onPress={() => router.push(`/admin/properties/edit/${property.id}` as any)}
                                    >
                                        <MaterialIcons name="edit" size={18} color="#334155" />
                                        <Text className="text-slate-700 font-semibold text-sm ml-1.5">Edit</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className="flex-row items-center bg-rose-50 border border-rose-100 px-3 py-2 rounded-lg"
                                        onPress={() => handleDeleteSingle(property.id)}
                                    >
                                        <MaterialIcons name="delete-outline" size={18} color="#e11d48" />
                                        <Text className="text-rose-700 font-semibold text-sm ml-1">Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </Pressable>
                        ))
                    )}
            </ScrollView>
        </View>
    );
}
