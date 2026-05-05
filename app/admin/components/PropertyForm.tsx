import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
  useWindowDimensions,
  Pressable,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { createProperty, updateProperty, uploadPropertyImages } from '../../service/admin-service';
import { Property, Media } from '../../constants/mock/mock-properties';
import AdminMapPicker from './AdminMapPicker';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

type PhotoSlot =
  | { id: string; kind: 'url'; media: Partial<Media> }
  | { id: string; kind: 'staged'; asset: ImagePicker.ImagePickerAsset };

function slotsFromInitialMedia(media: Media[] | undefined): PhotoSlot[] {
  if (!media?.length) return [];
  const ordered = [...media].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return 0;
  });
  return ordered.map((m, i) => ({
    id: `init-${m.id ?? i}-${String(m.url).slice(-12)}`,
    kind: 'url' as const,
    media: {
      url: m.url,
      type: m.type ?? 'image',
      cloudinaryPublicId: m.cloudinaryPublicId ?? undefined,
      id: m.id,
    },
  }));
}

interface PropertyFormProps {
  initialData?: Property;
  isEdit?: boolean;
}

type FormTab = 'basic' | 'location' | 'map' | 'dimensions' | 'features' | 'photos';

type FieldErrors = {
  title?: string;
  price?: string;
  city?: string;
  province?: string;
  boundaries?: string;
};

const FORM_TABS: { id: FormTab; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { id: 'basic', label: 'Basics', icon: 'description' },
  { id: 'location', label: 'Location', icon: 'place' },
  { id: 'map', label: 'Map & bounds', icon: 'map' },
  { id: 'dimensions', label: 'Size & rooms', icon: 'straighten' },
  { id: 'features', label: 'Features', icon: 'star-outline' },
  { id: 'photos', label: 'Photos', icon: 'photo-library' },
];

export default function PropertyForm({ initialData, isEdit = false }: PropertyFormProps) {
  const router = useRouter();
  const leavePropertyForm = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/admin/properties' as any);
    }
  }, [router]);
  const { width: windowWidth } = useWindowDimensions();
  const [loading, setLoading] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<FormTab>('basic');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  
  // Basic Info
  const [title, setTitle] = useState(initialData?.title || '');
  const [type, setType] = useState((initialData?.type || 'HOUSE').toUpperCase());
  const [status, setStatus] = useState((initialData?.status || 'AVAILABLE').toUpperCase());
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  const [details, setDetails] = useState(initialData?.details || '');

  // Dimensions
  const [lotArea, setLotArea] = useState(initialData?.lotArea?.toString() || '');
  const [floorArea, setFloorArea] = useState(initialData?.floorArea?.toString() || '');
  const [bedRooms, setBedRooms] = useState(initialData?.bedRooms?.toString() || initialData?.bedrooms?.toString() || '');
  const [bathRooms, setBathRooms] = useState(initialData?.bathRooms?.toString() || initialData?.bathrooms?.toString() || '');
  const [parking, setParking] = useState(initialData?.parking?.toString() || '');

  // Location
  const [address, setAddress] = useState(initialData?.location?.address || '');
  const [barangay, setBarangay] = useState(initialData?.location?.barangay || '');
  const [city, setCity] = useState(initialData?.location?.city || '');
  const [province, setProvince] = useState(initialData?.location?.province || '');
  
  // Maps & Boundaries
  const [latitude, setLatitude] = useState(initialData?.location?.coordinates?.lat?.toString() || '');
  const [longitude, setLongitude] = useState(initialData?.location?.coordinates?.lng?.toString() || '');
  const [boundariesRaw, setBoundariesRaw] = useState(initialData?.location?.boundaries ? JSON.stringify(initialData.location.boundaries, null, 2) : '');
  
  const [photoSlots, setPhotoSlots] = useState<PhotoSlot[]>(() => slotsFromInitialMedia(initialData?.media));
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set());
  const [photoDropHover, setPhotoDropHover] = useState(false);
  const [draggingPhotoId, setDraggingPhotoId] = useState<string | null>(null);
  const [dragOverPhotoId, setDragOverPhotoId] = useState<string | null>(null);
  const photoDropDepthRef = useRef(0);
  const photoDropTileRef = useRef<View | null>(null);
  const photoTileRefs = useRef<Record<string, View | null>>({});
  const dragPreviewRef = useRef<HTMLElement | null>(null);

  const galleryCols = windowWidth >= 960 ? 4 : windowWidth >= 640 ? 3 : 2;
  const galleryGap = 12;
  const contentInner = Math.max(260, Math.min(windowWidth - 64, 820));
  const rawTile = Math.floor((contentInner - galleryGap * (galleryCols - 1)) / galleryCols);
  const tileSize = Math.max(104, Math.min(200, rawTile));

  // Features & Amenities
  const AVAILABLE_FEATURES = [
      { key: "road", name: "Main Road" },
      { key: "hospital", name: "Hospital" },
      { key: "school", name: "School" },
      { key: "store", name: "Market" },
      { key: "beach", name: "Beach Spot" },
      { key: "shopping", name: "Mall Nearby" },
      { key: "parking", name: "Parking" },
  ];
  
  const AVAILABLE_AMENITIES = [
      { key: "pool", name: "Swimming Pool" },
      { key: "gym", name: "Gym" },
      { key: "security", name: "24/7 Security" },
      { key: "elevator", name: "Elevator" },
  ];

  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set((initialData?.features || (initialData as any)?.feature || []).map((f: any) => f.key)));
  const [selectedAmenities, setSelectedAmenities] = useState<Set<string>>(new Set((initialData?.amenities || (initialData as any)?.amenity || []).map((a: any) => a.key)));

  const toggleFeature = (key: string) => {
      const next = new Set(selectedFeatures);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      setSelectedFeatures(next);
  };

  const toggleAmenity = (key: string) => {
      const next = new Set(selectedAmenities);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      setSelectedAmenities(next);
  };

  const genPhotoId = useCallback(() => `p-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, []);

  const removePhotoById = (id: string) => {
    setPhotoSlots((prev) => prev.filter((s) => s.id !== id));
    setSelectedPhotoIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const togglePhotoSelected = (id: string) => {
    setSelectedPhotoIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllPhotos = () => {
    if (selectedPhotoIds.size === photoSlots.length) {
      setSelectedPhotoIds(new Set());
    } else {
      setSelectedPhotoIds(new Set(photoSlots.map((s) => s.id)));
    }
  };

  const deleteSelectedPhotos = () => {
    if (selectedPhotoIds.size === 0) return;
    const n = selectedPhotoIds.size;
    const ids = new Set(selectedPhotoIds);
    const run = () => {
      setPhotoSlots((prev) => prev.filter((s) => !ids.has(s.id)));
      setSelectedPhotoIds(new Set());
    };
    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      if (window.confirm(`Remove ${n} photo${n === 1 ? '' : 's'} from this listing?`)) run();
    } else {
      Alert.alert('Remove photos', `Remove ${n} photo${n === 1 ? '' : 's'} from this listing?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: run },
      ]);
    }
  };

  const setAsPrimary = (id: string) => {
    setPhotoSlots((prev) => {
      const i = prev.findIndex((s) => s.id === id);
      if (i <= 0) return prev;
      const next = [...prev];
      const [item] = next.splice(i, 1);
      next.unshift(item);
      return next;
    });
  };

  const reorderPhotoSlots = useCallback((sourceId: string, targetId: string) => {
    if (!sourceId || !targetId || sourceId === targetId) return;
    setPhotoSlots((prev) => {
      const sourceIndex = prev.findIndex((s) => s.id === sourceId);
      const targetIndex = prev.findIndex((s) => s.id === targetId);
      if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return prev;
      const next = [...prev];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  }, []);

  const setPhotoTileRef = useCallback((id: string, node: View | null) => {
    if (node) {
      photoTileRefs.current[id] = node;
      return;
    }
    delete photoTileRefs.current[id];
  }, []);

  const clearFieldError = (key: keyof FieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const tabHasError = (tab: FormTab) => {
    if (tab === 'basic') return !!(fieldErrors.title || fieldErrors.price);
    if (tab === 'location') return !!(fieldErrors.city || fieldErrors.province);
    if (tab === 'map') return !!fieldErrors.boundaries;
    return false;
  };

  const validateForm = (): { ok: boolean; firstTab: FormTab | null } => {
    const errors: FieldErrors = {};
    let firstTab: FormTab | null = null;
    const mark = (tab: FormTab) => {
      if (!firstTab) firstTab = tab;
    };

    if (!title.trim()) {
      errors.title = 'Title is required.';
      mark('basic');
    }

    const trimmedPrice = price.trim();
    const priceNum = parseFloat(trimmedPrice.replace(/,/g, ''));
    if (!trimmedPrice || Number.isNaN(priceNum) || priceNum <= 0) {
      errors.price = 'Enter a valid price greater than zero.';
      mark('basic');
    }

    if (!city.trim()) {
      errors.city = 'City or municipality is required.';
      mark('location');
    }
    if (!province.trim()) {
      errors.province = 'Province is required.';
      mark('location');
    }

    if (boundariesRaw.trim()) {
      try {
        const parsed = JSON.parse(boundariesRaw);
        if (!Array.isArray(parsed)) {
          errors.boundaries = 'Boundaries must be a JSON array of points.';
          mark('map');
        }
      } catch {
        errors.boundaries = 'Invalid JSON. Expected an array of { lat, lng } objects.';
        mark('map');
      }
    }

    setFieldErrors(errors);
    return { ok: Object.keys(errors).length === 0, firstTab };
  };

  const appendStagedPickerAssets = useCallback(
    (assets: ImagePicker.ImagePickerAsset[]) => {
      if (!assets.length) return;
      const tooLarge = assets.find((a) => a.fileSize != null && a.fileSize > MAX_IMAGE_BYTES);
      if (tooLarge) {
        Alert.alert('File too large', 'Each image must be 10MB or smaller.');
        return;
      }
      setPhotoSlots((prev) => [
        ...prev,
        ...assets.map((asset) => ({ id: genPhotoId(), kind: 'staged' as const, asset })),
      ]);
    },
    [genPhotoId]
  );

  const pickImages = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo library access to upload images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.85,
    });
    if (result.canceled) return;
    appendStagedPickerAssets(result.assets);
  }, [appendStagedPickerAssets]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onWindowDragOver = (event: DragEvent) => {
      event.preventDefault();
    };
    const onWindowDrop = (event: DragEvent) => {
      event.preventDefault();
    };
    window.addEventListener('dragover', onWindowDragOver);
    window.addEventListener('drop', onWindowDrop);
    return () => {
      window.removeEventListener('dragover', onWindowDragOver);
      window.removeEventListener('drop', onWindowDrop);
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (activeTab !== 'photos') return;
    const node = photoDropTileRef.current as unknown as HTMLElement | null;
    if (!node) return;

    const hasFiles = (e: DragEvent) => {
      const types = e.dataTransfer?.types;
      if (!types) return false;
      for (let i = 0; i < types.length; i++) {
        if (types[i] === 'Files') return true;
      }
      return false;
    };

    const onDragEnter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      photoDropDepthRef.current += 1;
      setPhotoDropHover(true);
    };
    const onDragOver = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    };
    const onDragLeave = (e: DragEvent) => {
      e.preventDefault();
      photoDropDepthRef.current = Math.max(0, photoDropDepthRef.current - 1);
      if (photoDropDepthRef.current === 0) setPhotoDropHover(false);
    };
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      photoDropDepthRef.current = 0;
      setPhotoDropHover(false);
      const files = e.dataTransfer?.files;
      if (!files?.length) return;
      const imageFiles: File[] = [];
      for (let i = 0; i < files.length; i++) {
        const f = files.item(i);
        if (f && f.type.startsWith('image/')) imageFiles.push(f);
      }
      if (!imageFiles.length) {
        Alert.alert('No images', 'Drop image files only (for example PNG, JPEG, or WebP).');
        return;
      }
      const assets: ImagePicker.ImagePickerAsset[] = imageFiles.map((file) => ({
        uri: URL.createObjectURL(file),
        width: 0,
        height: 0,
        type: 'image' as const,
        mimeType: file.type || 'image/jpeg',
        fileName: file.name,
        fileSize: file.size,
        file,
      }));
      appendStagedPickerAssets(assets);
    };

    node.addEventListener('dragenter', onDragEnter);
    node.addEventListener('dragover', onDragOver);
    node.addEventListener('dragleave', onDragLeave);
    node.addEventListener('drop', onDrop);
    return () => {
      node.removeEventListener('dragenter', onDragEnter);
      node.removeEventListener('dragover', onDragOver);
      node.removeEventListener('dragleave', onDragLeave);
      node.removeEventListener('drop', onDrop);
    };
  }, [activeTab, appendStagedPickerAssets]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (activeTab !== 'photos') return;
    if (!photoSlots.length) return;

    const cleanups: Array<() => void> = [];

    for (const slot of photoSlots) {
      const node = photoTileRefs.current[slot.id] as unknown as HTMLElement | null;
      if (!node) continue;

      node.setAttribute('draggable', 'true');
      node.style.cursor = 'grab';

      const onDragStart = (e: DragEvent) => {
        setDraggingPhotoId(slot.id);
        setDragOverPhotoId(null);
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', slot.id);
          const preview = node.cloneNode(true) as HTMLElement;
          preview.style.position = 'fixed';
          preview.style.top = '-9999px';
          preview.style.left = '-9999px';
          preview.style.width = `${node.clientWidth}px`;
          preview.style.height = `${node.clientHeight}px`;
          preview.style.transform = 'scale(1.04)';
          preview.style.borderRadius = '14px';
          preview.style.boxShadow = '0 18px 35px rgba(15, 23, 42, 0.35)';
          preview.style.opacity = '0.97';
          preview.style.pointerEvents = 'none';
          preview.style.zIndex = '9999';
          document.body.appendChild(preview);
          dragPreviewRef.current = preview;
          e.dataTransfer.setDragImage(preview, node.clientWidth / 2, node.clientHeight / 2);
        }
      };
      const onDragOver = (e: DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
        setDragOverPhotoId(slot.id);
      };
      const onDragLeave = () => {
        setDragOverPhotoId((prev) => (prev === slot.id ? null : prev));
      };
      const onDrop = (e: DragEvent) => {
        e.preventDefault();
        const sourceId = e.dataTransfer?.getData('text/plain') || draggingPhotoId;
        if (sourceId) reorderPhotoSlots(sourceId, slot.id);
        setDragOverPhotoId(null);
      };
      const onDragEnd = () => {
        if (dragPreviewRef.current) {
          dragPreviewRef.current.remove();
          dragPreviewRef.current = null;
        }
        setDraggingPhotoId(null);
        setDragOverPhotoId(null);
      };

      node.addEventListener('dragstart', onDragStart);
      node.addEventListener('dragover', onDragOver);
      node.addEventListener('dragleave', onDragLeave);
      node.addEventListener('drop', onDrop);
      node.addEventListener('dragend', onDragEnd);

      cleanups.push(() => {
        node.removeEventListener('dragstart', onDragStart);
        node.removeEventListener('dragover', onDragOver);
        node.removeEventListener('dragleave', onDragLeave);
        node.removeEventListener('drop', onDrop);
        node.removeEventListener('dragend', onDragEnd);
        node.removeAttribute('draggable');
      });
    }

    return () => {
      if (dragPreviewRef.current) {
        dragPreviewRef.current.remove();
        dragPreviewRef.current = null;
      }
      for (const cleanup of cleanups) cleanup();
    };
  }, [activeTab, photoSlots, draggingPhotoId, reorderPhotoSlots]);

  const handleSave = async () => {
    const { ok, firstTab } = validateForm();
    if (!ok) {
      if (firstTab) setActiveTab(firstTab);
      Alert.alert('Check your entries', 'Some required fields are missing or invalid. Review the highlighted fields.');
      return;
    }

    let parsedBoundaries = null;
    if (boundariesRaw.trim()) {
      parsedBoundaries = JSON.parse(boundariesRaw);
    }

    setLoading(true);

    const stagedInOrder = photoSlots.filter((s): s is Extract<PhotoSlot, { kind: 'staged' }> => s.kind === 'staged');
    let mediaSnapshot: Partial<Media>[] = [];

    if (stagedInOrder.length) {
      for (const s of stagedInOrder) {
        const a = s.asset;
        if (a.fileSize != null && a.fileSize > MAX_IMAGE_BYTES) {
          setLoading(false);
          Alert.alert('File too large', 'Each image must be 10MB or smaller.');
          return;
        }
      }
      const uploaded = await uploadPropertyImages(
        stagedInOrder.map((s) => ({
          uri: s.asset.uri,
          name: s.asset.fileName ?? undefined,
          mimeType: s.asset.mimeType ?? undefined,
        }))
      );
      if (uploaded === null || uploaded.length !== stagedInOrder.length) {
        setLoading(false);
        Alert.alert('Upload failed', 'Could not upload images. Check your API and Cloudinary configuration.');
        return;
      }
      let upIdx = 0;
      mediaSnapshot = photoSlots.map((slot) => {
        if (slot.kind === 'url') {
          return { ...slot.media, type: (slot.media.type ?? 'image') as 'image' | 'video' };
        }
        const u = uploaded[upIdx++];
        return {
          url: u.url,
          type: 'image' as const,
          cloudinaryPublicId: u.cloudinaryPublicId,
        };
      });
      const newSlots: PhotoSlot[] = mediaSnapshot
        .filter((m) => typeof m.url === 'string' && m.url.trim().length > 0)
        .map((m, i) => ({
          id: `saved-${i}-${String(m.url).slice(-10)}`,
          kind: 'url' as const,
          media: m,
        }));
      setPhotoSlots(newSlots);
      setSelectedPhotoIds(new Set());
    } else {
      mediaSnapshot = photoSlots
        .filter((s): s is Extract<PhotoSlot, { kind: 'url' }> => s.kind === 'url')
        .map((s) => ({ ...s.media, type: (s.media.type ?? 'image') as 'image' | 'video' }));
    }

    const dataToSave = {
        title,
        type,
        status,
        price: parseFloat(price.trim().replace(/,/g, '')),
        details,
        lotArea: lotArea ? parseFloat(lotArea) : null,
        floorArea: floorArea ? parseFloat(floorArea) : null,
        bedRooms: bedRooms ? parseInt(bedRooms) : null,
        bathRooms: bathRooms ? parseInt(bathRooms) : null,
        parking: parking ? parseInt(parking) : null,
        location: {
            address,
            barangay,
            city,
            province,
            country: 'Philippines',
            coordinates: (latitude && longitude) ? { lat: parseFloat(latitude), lng: parseFloat(longitude) } : undefined,
            boundaries: parsedBoundaries,
        },
        media: mediaSnapshot
            .filter((m) => typeof m.url === 'string' && m.url.trim().length > 0)
            .map((m, i) => ({
            url: m.url as string,
            isPrimary: i === 0,
            type: 'image',
            cloudinaryPublicId: m.cloudinaryPublicId ?? undefined,
        })),
        features: Array.from(selectedFeatures).map(key => ({ key })),
        amenities: Array.from(selectedAmenities).map(key => ({ key }))
    };

    let result;
    if (isEdit && initialData?.id) {
        result = await updateProperty(initialData.id, dataToSave as any);
    } else {
        result = await createProperty(dataToSave as any);
    }

    setLoading(false);

    if (result) {
      Alert.alert('Success', isEdit ? 'Property updated successfully.' : 'Property created successfully.', [
        { text: 'OK', onPress: () => leavePropertyForm() },
      ]);
    } else {
      Alert.alert('Save failed', 'The operation could not complete. Check your connection and try again.');
    }
  };

  const InputField = ({
    label,
    value,
    onChangeText,
    keyboardType = 'default' as const,
    multiline = false,
    required = false,
    error,
  }: {
    label: string;
    value: string;
    onChangeText: (t: string) => void;
    keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
    multiline?: boolean;
    required?: boolean;
    error?: string;
  }) => (
    <View className="mb-4">
      <Text className="text-gray-700 font-semibold mb-2">
        {label} {required ? <Text className="text-red-500">*</Text> : null}
      </Text>
      <TextInput
        className={`bg-white border rounded-lg p-3 text-gray-800 ${multiline ? 'min-h-[80px] text-left' : ''} ${
          error ? 'border-red-400 bg-red-50/40' : 'border-gray-200'
        }`}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        style={multiline ? { textAlignVertical: 'top' } : undefined}
        placeholder={`Enter ${label.toLowerCase()}`}
        accessibilityLabel={label}
      />
      {error ? <Text className="text-red-600 text-sm mt-1.5">{error}</Text> : null}
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50 w-full" style={{ minHeight: 0 }}>
        <View className="flex-1 flex-row min-h-0 bg-slate-100" style={{ minHeight: 0 }}>
          <View
            className="shrink-0 bg-white border-r border-slate-200"
            style={{ width: 220, alignSelf: 'stretch', flexDirection: 'column' }}
          >
            <View className="flex-1 py-3 px-2" style={{ minHeight: 0 }}>
              <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Sections</Text>
              {FORM_TABS.map((tab) => {
                const active = activeTab === tab.id;
                const errDot = tabHasError(tab.id);
                return (
                  <Pressable
                    key={tab.id}
                    onPress={() => setActiveTab(tab.id)}
                    className={`flex-row items-center py-3 rounded-lg mb-0.5 ${active ? 'bg-blue-50' : ''}`}
                    style={
                      active
                        ? { borderLeftWidth: 3, borderLeftColor: '#2563eb', paddingLeft: 10, paddingRight: 10 }
                        : { paddingLeft: 13, paddingRight: 10 }
                    }
                  >
                    <MaterialIcons name={tab.icon} size={20} color={active ? '#1d4ed8' : '#64748b'} />
                    <Text
                      className="ml-2.5 font-semibold text-[15px] flex-1"
                      style={{ color: active ? '#1e3a8a' : '#334155' }}
                      numberOfLines={2}
                    >
                      {tab.label}
                    </Text>
                    {errDot ? <View className="w-2 h-2 rounded-full bg-red-500 ml-1" /> : null}
                  </Pressable>
                );
              })}
            </View>

            <View className="border-t border-slate-200 px-2 pt-3 pb-3" style={{ gap: 8 }}>
              <TouchableOpacity
                className="w-full py-2.5 rounded-lg flex-row items-center justify-center bg-slate-100 border border-slate-200 active:opacity-80"
                onPress={() => leavePropertyForm()}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel="Cancel without saving"
              >
                <MaterialIcons name="arrow-back" size={18} color="#334155" />
                <Text className="text-slate-800 font-semibold ml-2">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`w-full py-2.5 rounded-lg flex-row items-center justify-center border ${
                  loading ? 'bg-blue-400 border-blue-400' : 'bg-blue-600 border-blue-600'
                } active:opacity-90`}
                onPress={handleSave}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel="Save property"
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <MaterialIcons name="save" size={18} color="#fff" />
                )}
                <Text className="text-white font-semibold ml-2">Save</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-1 min-h-0 min-w-0 bg-slate-50" style={{ flex: 1, minHeight: 0 }}>
            <View className="flex-1 px-6 py-5" style={{ flex: 1, minHeight: 0 }}>
        {activeTab === 'basic' && (
        <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
            <Text className="text-lg font-bold text-gray-800 mb-1">Basics</Text>
            <Text className="text-gray-500 text-sm mb-4 border-b border-gray-100 pb-3">Title, price, type, status, and description</Text>
            <InputField label="Title" value={title} onChangeText={(t) => { setTitle(t); clearFieldError('title'); }} required error={fieldErrors.title} />
            <InputField label="Description/Details" value={details} onChangeText={setDetails} multiline />
            
            <View className="flex-row flex-wrap -mx-2">
                <View className="w-1/3 px-2">
                    <InputField
                      label="Price (PHP)"
                      value={price}
                      onChangeText={(t) => {
                        setPrice(t);
                        clearFieldError('price');
                      }}
                      keyboardType="numeric"
                      required
                      error={fieldErrors.price}
                    />
                </View>
                <View className="w-1/3 px-2 mb-4">
                     <Text className="text-gray-700 font-semibold mb-2">Type</Text>
                     <View className="flex-row border border-gray-200 rounded-lg overflow-hidden">
                        
                        {['LOT', 'HOUSE', 'CONDO'].map(t => (
                            <TouchableOpacity 
                                key={t} 
                                className={`flex-1 py-3 items-center ${type === t ? 'bg-blue-600' : 'bg-white'}`}
                                onPress={() => setType(t as any)}
                            >
                                <Text className={`capitalize font-semibold ${type === t ? 'text-white' : 'text-gray-600'}`}>{t}</Text>
                            </TouchableOpacity>
                        ))}
                     </View>
                </View>
                <View className="w-1/3 px-2 mb-4">
                     <Text className="text-gray-700 font-semibold mb-2">Status</Text>
                     <View className="flex-row border border-gray-200 rounded-lg overflow-hidden">
                        {['AVAILABLE', 'SOLD', 'RESERVED'].map(s => (
                            <TouchableOpacity 
                                key={s} 
                                className={`flex-1 py-3 items-center ${status === s ? 'bg-blue-600' : 'bg-white'}`}
                                onPress={() => setStatus(s as any)}
                            >
                                <Text className={`capitalize font-semibold ${status === s ? 'text-white' : 'text-gray-600'}`}>{s}</Text>
                            </TouchableOpacity>
                        ))}
                     </View>
                </View>
            </View>
        </View>
        )}

        {activeTab === 'location' && (
        <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
            <Text className="text-lg font-bold text-gray-800 mb-1">Location</Text>
            <Text className="text-gray-500 text-sm mb-4 border-b border-gray-100 pb-3">
              Street address, barangay, city, and province
            </Text>
            <InputField label="Address (Street/Subdivision)" value={address} onChangeText={setAddress} />
            <InputField label="Barangay" value={barangay} onChangeText={setBarangay} />
            <View className="flex-row flex-wrap -mx-2">
                <View className="w-1/2 px-2">
                    <InputField
                      label="City/Municipality"
                      value={city}
                      onChangeText={(t) => {
                        setCity(t);
                        clearFieldError('city');
                      }}
                      required
                      error={fieldErrors.city}
                    />
                </View>
                <View className="w-1/2 px-2">
                    <InputField
                      label="Province"
                      value={province}
                      onChangeText={(t) => {
                        setProvince(t);
                        clearFieldError('province');
                      }}
                      required
                      error={fieldErrors.province}
                    />
                </View>
            </View>
        </View>
        )}

        {activeTab === 'map' && (
        <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
            <Text className="text-lg font-bold text-gray-800 mb-1">Map coordinates & boundaries</Text>
            <Text className="text-gray-500 text-sm mb-4 border-b border-gray-100 pb-3">
              Place the pin and draw a boundary polygon in the map editor
            </Text>
            <View className="flex-row flex-wrap items-center justify-between gap-3 mb-4">
                <Text className="text-gray-700 font-semibold flex-1 min-w-[160px]">Map editor</Text>
                <TouchableOpacity
                   className="bg-blue-600 px-4 py-2.5 rounded-lg flex-row items-center shadow-sm shrink-0"
                   onPress={() => setIsMapModalOpen(true)}
                >
                   <MaterialIcons name="map" size={18} color="white" />
                   <Text className="text-white font-bold ml-2">Open map editor</Text>
                </TouchableOpacity>
            </View>

            {latitude && longitude ? (
                <View className="mb-4">
                  <Text className="text-gray-700 font-semibold mb-1">Pin (lat / lng)</Text>
                  <Text className="text-gray-600 font-mono bg-gray-50 p-3 rounded-lg border border-gray-200">{latitude}, {longitude}</Text>

                  <Text className="text-gray-700 font-semibold mt-3 mb-1">Drawn boundaries (polygon points)</Text>
                  <Text className="text-gray-600 font-mono bg-gray-50 p-3 rounded-lg border border-gray-200">
                     {boundariesRaw ? (() => {
                         try {
                             return JSON.parse(boundariesRaw).length + ' points configured';
                         } catch {
                             return 'Invalid / no JSON';
                         }
                     })() : 'No polygon drawn'}
                  </Text>
                </View>
            ) : (
                <Text className="text-gray-500 italic mb-4">
                  No map location set yet. Use Open map editor to place the pin and optional boundary.
                </Text>
            )}
            {fieldErrors.boundaries ? (
              <Text className="text-red-600 text-sm">{fieldErrors.boundaries}</Text>
            ) : null}
        </View>
        )}

        {activeTab === 'dimensions' && (
        <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
            <Text className="text-lg font-bold text-gray-800 mb-1">Size & rooms</Text>
            <Text className="text-gray-500 text-sm mb-4 border-b border-gray-100 pb-3">Lot size, floor area, and counts</Text>
            <View className="flex-row flex-wrap -mx-2">
                <View className="w-1/3 px-2">
                    <InputField label="Lot Area (sqm)" value={lotArea} onChangeText={setLotArea} keyboardType="numeric" />
                </View>
                <View className="w-1/3 px-2">
                    <InputField label="Floor Area (sqm)" value={floorArea} onChangeText={setFloorArea} keyboardType="numeric" />
                </View>
                <View className="w-1/3 px-2">
                    <InputField label="Bedrooms" value={bedRooms} onChangeText={setBedRooms} keyboardType="numeric" />
                </View>
                <View className="w-1/2 px-2">
                    <InputField label="Bathrooms" value={bathRooms} onChangeText={setBathRooms} keyboardType="numeric" />
                </View>
                <View className="w-1/2 px-2">
                    <InputField label="Parking Slots" value={parking} onChangeText={setParking} keyboardType="numeric" />
                </View>
            </View>
        </View>
        )}

        {activeTab === 'features' && (
        <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
            <Text className="text-lg font-bold text-gray-800 mb-1">Features & amenities</Text>
            <Text className="text-gray-500 text-sm mb-4 border-b border-gray-100 pb-3">Tap to toggle what applies to this listing</Text>
            <View className="flex-row flex-wrap -mx-2">
                <View className="w-1/2 px-2">
                    <Text className="text-base font-bold text-gray-800 mb-3">Nearby features</Text>
                    <View className="flex-row flex-wrap">
                        {AVAILABLE_FEATURES.map(f => (
                            <TouchableOpacity 
                                key={f.key}
                                className={`mr-2 mb-2 px-3 py-2 rounded-full border ${selectedFeatures.has(f.key) ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-300'}`}
                                onPress={() => toggleFeature(f.key)}
                            >
                                <Text className={`${selectedFeatures.has(f.key) ? 'text-blue-700 font-semibold' : 'text-gray-600'}`}>
                                    {f.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
                <View className="w-1/2 px-2">
                    <Text className="text-base font-bold text-gray-800 mb-3">Amenities</Text>
                    <View className="flex-row flex-wrap">
                        {AVAILABLE_AMENITIES.map(a => (
                            <TouchableOpacity 
                                key={a.key}
                                className={`mr-2 mb-2 px-3 py-2 rounded-full border ${selectedAmenities.has(a.key) ? 'bg-green-50 border-green-500' : 'bg-white border-gray-300'}`}
                                onPress={() => toggleAmenity(a.key)}
                            >
                                <Text className={`${selectedAmenities.has(a.key) ? 'text-green-700 font-semibold' : 'text-gray-600'}`}>
                                    {a.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </View>
        )}

        {activeTab === 'photos' && (
        <View
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1"
          style={{ minHeight: 0, marginBottom: 0 }}
        >
          <View className="flex-row flex-wrap items-center justify-between gap-3 mb-4 border-b border-gray-100 pb-4 shrink-0">
            <View>
              <Text className="text-lg font-bold text-gray-800">Photos</Text>
              <Text className="text-gray-500 text-sm mt-1">
                Gallery order = listing order. First photo is the cover.{' '}
                {Platform.OS === 'web'
                  ? 'Drag existing photos to reorder. Click the dashed tile to choose files, or drag images directly onto it.'
                  : 'Tap the dashed tile to add from your device.'}{' '}
                Max 10MB each.
              </Text>
            </View>
            <View className="flex-row flex-wrap items-center" style={{ gap: 10 }}>
              {photoSlots.length > 0 && (
                <>
                  <TouchableOpacity
                    className="px-3 py-2 rounded-lg bg-gray-100 border border-gray-200"
                    onPress={selectAllPhotos}
                    disabled={loading}
                  >
                    <Text className="text-gray-800 font-semibold text-sm">
                      {selectedPhotoIds.size === photoSlots.length ? 'Clear selection' : 'Select all'}
                    </Text>
                  </TouchableOpacity>
                  {selectedPhotoIds.size > 0 && (
                    <TouchableOpacity
                      className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 flex-row items-center"
                      onPress={deleteSelectedPhotos}
                      disabled={loading}
                    >
                      <MaterialIcons name="delete-outline" size={18} color="#b91c1c" />
                      <Text className="text-red-700 font-semibold text-sm ml-1">
                        Delete ({selectedPhotoIds.size})
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          </View>

          <ScrollView
            style={{ flex: 1, minHeight: 0 }}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 8 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
          <View className="flex-row flex-wrap" style={{ gap: galleryGap, paddingBottom: 4 }}>
            {photoSlots.map((slot, index) => {
              const uri = slot.kind === 'url' ? (slot.media.url as string) : slot.asset.uri;
              const isStaged = slot.kind === 'staged';
              const isSelected = selectedPhotoIds.has(slot.id);
              const isPrimary = index === 0;
              return (
                <View
                  key={slot.id}
                  ref={(node) => setPhotoTileRef(slot.id, node)}
                  style={{
                    width: tileSize,
                    height: tileSize,
                    borderRadius: 14,
                    overflow: 'hidden',
                    borderWidth: 2,
                    borderColor: dragOverPhotoId === slot.id
                      ? '#4338ca'
                      : isSelected
                        ? '#2563eb'
                        : isPrimary
                          ? '#93c5fd'
                          : '#e5e7eb',
                    backgroundColor: dragOverPhotoId === slot.id ? '#e0e7ff' : '#f1f5f9',
                    opacity: draggingPhotoId === slot.id ? 0.28 : 1,
                    transform: draggingPhotoId === slot.id ? [{ scale: 0.96 }] : undefined,
                    shadowColor: dragOverPhotoId === slot.id ? '#4338ca' : '#0f172a',
                    shadowOpacity: dragOverPhotoId === slot.id ? 0.32 : 0.08,
                    shadowRadius: dragOverPhotoId === slot.id ? 10 : 4,
                    shadowOffset: { width: 0, height: dragOverPhotoId === slot.id ? 6 : 2 },
                    elevation: dragOverPhotoId === slot.id ? 8 : 1,
                  }}
                >
                  <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />

                  <View
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: 0,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      padding: 8,
                    }}
                  >
                    <Pressable
                      onPress={() => togglePhotoSelected(slot.id)}
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.92)',
                        borderRadius: 8,
                        padding: 4,
                      }}
                      hitSlop={8}
                    >
                      <MaterialIcons
                        name={isSelected ? 'check-box' : 'check-box-outline-blank'}
                        size={22}
                        color={isSelected ? '#2563eb' : '#64748b'}
                      />
                    </Pressable>

                    {isPrimary ? (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: 'rgba(37,99,235,0.95)',
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          borderRadius: 8,
                          gap: 4,
                        }}
                      >
                        <MaterialIcons name="star" size={16} color="#fff" />
                        <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>COVER</Text>
                      </View>
                    ) : (
                      <Pressable
                        onPress={() => setAsPrimary(slot.id)}
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.92)',
                          borderRadius: 8,
                          padding: 4,
                        }}
                        hitSlop={8}
                      >
                        <MaterialIcons name="star-border" size={22} color="#ca8a04" />
                      </Pressable>
                    )}
                  </View>

                  {isStaged && (
                    <View
                      style={{
                        position: 'absolute',
                        left: 8,
                        bottom: 44,
                        backgroundColor: 'rgba(245,158,11,0.95)',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6,
                      }}
                    >
                      <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>PENDING UPLOAD</Text>
                    </View>
                  )}

                  <Pressable
                    onPress={() => removePhotoById(slot.id)}
                    style={{
                      position: 'absolute',
                      right: 8,
                      bottom: 8,
                      backgroundColor: 'rgba(254,242,242,0.96)',
                      borderRadius: 999,
                      padding: 8,
                      borderWidth: 1,
                      borderColor: '#fecaca',
                      zIndex: 4,
                    }}
                    hitSlop={6}
                  >
                    <MaterialIcons name="delete-outline" size={20} color="#dc2626" />
                  </Pressable>
                </View>
              );
            })}

            <Pressable
              ref={photoDropTileRef as React.RefObject<View>}
              onPress={pickImages}
              disabled={loading}
              style={{
                width: tileSize,
                height: tileSize,
                borderRadius: 14,
                overflow: 'hidden',
                borderWidth: 2,
                borderColor: photoDropHover ? '#6366f1' : '#e2e8f0',
                borderStyle: 'dashed',
                backgroundColor: photoDropHover ? '#eef2ff' : '#f8fafc',
              }}
            >
              <View
                style={{
                  position: 'absolute',
                  left: 12,
                  right: 12,
                  top: 14,
                  opacity: 0.45,
                }}
              >
                <View
                  style={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: '#cbd5e1',
                    width: '72%',
                    marginBottom: 8,
                  }}
                />
                <View
                  style={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#e2e8f0',
                    width: '55%',
                    marginBottom: 8,
                  }}
                />
                <View
                  style={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#e2e8f0',
                    width: '40%',
                  }}
                />
              </View>
              <View
                style={{
                  position: 'absolute',
                  bottom: 14,
                  left: 0,
                  right: 0,
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: '#e0e7ff',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#c7d2fe',
                  }}
                >
                  <MaterialIcons name="add-photo-alternate" size={26} color="#4f46e5" />
                </View>
                <Text
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    fontWeight: '700',
                    color: photoDropHover ? '#3730a3' : '#475569',
                    textAlign: 'center',
                    paddingHorizontal: 8,
                  }}
                >
                  {photoDropHover
                    ? 'Drop to upload'
                    : Platform.OS === 'web'
                      ? 'Drag or Click to upload'
                      : 'Add photos'}
                </Text>
              </View>
            </Pressable>
          </View>
          </ScrollView>
        </View>
        )}
            </View>
          </View>
        </View>

        <Modal visible={isMapModalOpen} animationType="fade" transparent={true}>
            <View className="flex-1 bg-black/60 justify-center items-center p-6">
                <View className="w-full max-w-5xl h-[85%] bg-white rounded-2xl shadow-xl overflow-hidden p-2">
                    <AdminMapPicker
                        initialCoordinates={(latitude && longitude) ? { lat: parseFloat(latitude), lng: parseFloat(longitude) } : undefined}
                        initialBoundaries={(() => {
                            try { return boundariesRaw ? JSON.parse(boundariesRaw) : []; }
                            catch(e) { return []; }
                        })()}
                        onSave={(coords, bounds) => {
                            setLatitude(coords.lat.toString());
                            setLongitude(coords.lng.toString());
                            setBoundariesRaw(bounds.length > 0 ? JSON.stringify(bounds, null, 2) : '');
                            clearFieldError('boundaries');
                            setIsMapModalOpen(false);
                        }}
                        onCancel={() => setIsMapModalOpen(false)}
                    />
                </View>
            </View>
        </Modal>
    </View>
  );
}
