import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, Modal, Pressable, ScrollView, Platform,
  useWindowDimensions, StyleSheet, TextInput, LayoutChangeEvent,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Dropdown } from 'react-native-element-dropdown';
import { getPropertyBounds } from '@/app/service/property-service';

export interface FilterState {
  type: string[];
  status: string[];
  features: string[];
  amenities: string[];
  minPrice: number;
  maxPrice: number;
  city: string;
  barangay: string;
  minArea: number;
  maxArea: number;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
}

const ILOCOS_SUR_LOCATIONS: Record<string, string[]> = {
  "Alilem": ["Alilem Daya", "Amilongan", "Anaao", "Apang", "Apaya", "Batbato", "Daddaay", "Dalawa", "Kiat"],
  "Banayoyo": ["Bagbagotot", "Banbanaal", "Cabaritan", "Elefante", "Guardia", "Lintic", "Montero", "Nagyubuyuban", "Pila", "Poblacion", "Surong", "Valenzuela", "Villaluz"],
  "Bantay": ["Aggay", "An-annam", "Balaleng", "Banaoang", "Bulag", "Buquig", "Cabalangegan", "Cabaroan", "Cabuscabusan", "Capangpangan", "Guimod", "Lingsat", "Malingeb", "Mira", "Ora", "Paing", "Puspus", "Quimmarayan", "Sagneb", "Sagpat", "San Isidro", "San Julian", "San Mariano", "San Martin", "San Vicente", "Taleb", "Tay-ac"],
  "Burgos": ["Amguid", "Balingaoan", "Banay", "Bessang", "Cabaritan", "Calingayan", "Dalig", "Dallang", "Dayawen", "Dirita", "Guang-guang", "Linao", "Luna", "Lucaban", "Macaoayan", "Mambug", "Mandirig", "Nagpanaoan", "Paday", "Pagangpang", "Patar", "San Vicente", "Sardeng", "Subadi Norte", "Subadi Sur", "Taliao"],
  "Cabugao": ["Alinaay", "Aragan", "Arnap", "Baclig", "Bato", "Bonifacio", "Bungro", "Cacadiran", "Caellayan", "Carusipan", "Catucdaan", "Cuancabal", "Cuantacla", "Daclapan", "Dardarat", "Lipit", "Marcos", "Margaay", "Nagsincaoan", "Namruangan", "Pila", "Pug-os", "Quezon", "Reppaac", "Rizal", "Sabang", "Sagayaden", "Salapasap", "Salomague", "Sisam", "Turod"],
  "Candon City": ["Allangigan 1st", "Allangigan 2nd", "Amboy", "Ayudante", "Bagani Campo", "Bagani Gabor", "Bagani Macalig", "Bagani Tocgo", "Bagani Ubbog", "Bagar", "Balingaoan", "Bugarin", "Calaoa-an", "Calongbuyan", "Caterman", "Cubcubbuot", "Darapidap", "Langlangca 1st", "Langlangca 2nd", "Oaig-Daya", "Palacapac", "Paras", "Parioc 1st", "Parioc 2nd", "Patpata 1st", "Patpata 2nd", "Paypayad", "San Agustin", "San Andres", "San Antonio", "San Isidro", "San Jose", "San Juan", "San Nicolas", "San Pedro", "Santo Tomas", "Tablac", "Talogtog", "Tamurong 1st", "Tamurong 2nd", "Villarica"],
  "Caoayan": ["Anonang Mayor", "Anonang Menor", "Baggoc", "Callaguip", "Caparacadan", "Fuerte", "Don Alejandro Quirolgico", "Don Dimas Querubin", "Don Lorenzo Querubin", "Manangat", "Naguilian", "Nansuagao", "Puro", "Tamurong", "Villamar", "Don Lino Abaya", "Pantay-Quitiquit"],
  "Cervantes": ["Aluling", "Comillas North", "Comillas South", "Concepcion", "Dinwede", "Malaya", "Pilipil", "Remedios", "Rosario", "San Juan", "San Luis", "Santa Clara", "Tagudin"],
  "Galimuyod": ["Abaya", "Baracbac", "Borobor", "Buyog", "Caliao", "Calimugtong", "Guimod", "Mckinley", "Nagsingcaoan", "Oaig-Daya", "Pagangpang", "Patac", "Poblacion", "San Vicente"],
  "Gregorio del Pilar": ["Alfonso", "Bussot", "Concepcion", "Doldol", "Mabatano", "Poblacion Norte", "Poblacion Sur"],
  "Lidlidda": ["Banucal", "Bequi-Walin", "Bugui", "Calungbuyan", "Caminawit", "Carcarabasa", "Labut", "Poblacion Norte", "Poblacion Sur", "San Vicente", "Suysuyan"],
  "Magsingal": ["Alangan", "Bacar", "Bato", "Bucarot", "Cabaroan", "Camarao", "Caraisan", "Dacutan", "Labut", "Maas-asin", "Macatcatud", "Maratudo", "Miramar", "Namarabar", "Napasan", "Puro", "Purok-a-dakkel", "Purok-a-bassit", "San Basilio", "San Clemente", "San Julian", "San Lucas", "San Ramon", "San Vicente", "Santa Monica", "Sarsaracat"],
  "Narvacan": ["Abuot", "Aquib", "Banglayan", "Blockhouse", "Bulanos", "Cadacad", "Cagayungan", "Camarao", "Casilian", "Codoog", "Dasay", "Dinalaoan", "Estancia", "Lanipao", "Lungog", "Margaay", "Marozo", "Nanguneg", "Orence", "Pantoc", "Paratong", "Parparia", "Quinarayan", "Rivadavia", "San Antonio", "San Jose", "San Pablo", "San Pedro", "Santa Lucia", "Sarmingan", "Sucoc", "Sulvec", "Turod"],
  "Quirino": ["Banoen", "Cayus", "Lamag", "Legleg", "Malideg", "Namitpit", "Patiacan", "Poblacion", "Suagayan"],
  "Salcedo": ["Baybayading", "Boguisil", "Calaoa-an", "Culiong", "Dinaratan", "Kaliwakiw", "Lucbuban", "Madansong", "Maligcong", "Miliang", "Poblacion", "Sagneb", "San Gaspar", "San Juan", "San Roque", "Sibut", "Tagita"],
  "San Emilio": ["Cabaroan", "Cancio", "Lancuas", "Matindeg", "Poblacion", "San Juan", "Sibsibbu", "Tiagan"],
  "San Ildefonso": ["Arnap", "Bahet", "Beling", "Bungro", "Busiing Sur", "Busiing Norte", "Gongogong", "Iboy", "Kinamantirisan", "Otol", "Poblacion", "Pudoc", "Sagsagat", "Sagat", "Tuya-a"],
  "San Juan": ["Asilang", "Bacsil", "Baliw", "Banneng", "Bao-ing", "Barbaran", "Camangaan", "Camindoroan", "Caronoan", "Darao", "Daramuang", "Guimod Norte", "Guimod Sur", "Immayos Norte", "Immayos Sur", "Labnig", "Lapting", "Lira", "Malamin", "Muraya", "Nagsabaran", "Nagsupotan", "Pandayan", "Refaro", "Resurreccion", "Sabangan", "San Isidro", "Saoang", "Solotsolot", "Sunggiam", "Surila"],
  "San Vicente": ["Bantaoay", "Bayubay Norte", "Bayubay Sur", "Lubong", "Pudoc", "San Sebastian"],
  "Santa": ["Ampandula", "Banaoang", "Basug", "Bucalag", "Cabangaran", "Calungboyan", "Casiber", "Dammay", "Labut Norte", "Labut Sur", "Mabilbila Norte", "Mabilbila Sur", "Magsaysay District", "Manueva", "Marcos District", "Nagpanaoan", "Namalangan", "Oribi", "Pasungol", "Quezon District", "Quirino District", "Rancho", "Rizal District", "Sacuyya Norte", "Sacuyya Sur", "San Jose"],
  "Santa Catalina": ["Cabittaogan", "Cabuloan", "Calongbuyan", "Namnama", "Paratong", "Poblacion", "Pangada", "Subec", "Tamurong"],
  "Santa Cruz": ["Amarao", "Babayoan", "Bacsayan", "Banay", "Bato", "Buliclic", "Calingayan", "Capanikian", "Casilian", "Daligan", "Mambug", "Mantaya", "Poblacion", "Sagapan", "San Antonio", "San Jose", "San Pedro", "Sevilla", "Sidaoen"],
  "Santa Lucia": ["Alincaoeg", "Angkileng", "Ayaoan", "Banbanaba", "Bantoc", "Bao-as", "Barangay I", "Barangay II", "Barangay III", "Bawani", "Buliclic", "Burgos", "Cabaritan", "Catayagan", "Conconig", "Cuartel", "Damacuag", "Lubong", "Lumbang", "Marcos", "Nagtocaoc", "Namnama", "Palali", "Paratong", "Pias", "Rondalla", "Sabuanan", "San Juan", "San Pedro", "Suagayan", "Valdefuente", "Vigan"],
  "Santa Maria": ["Ag-agrao", "Ampandula", "Babangot", "Baliw Daya", "Baliw Laud", "Bia-o", "Bulbulala", "Cabaroan", "Danuman East", "Danuman West", "Donghol", "Gusing", "Laslasong Norte", "Laslasong Sur", "Laslasong West", "Lesseb", "Lingsat", "Lubong", "Macatcatud", "Maynganay Norte", "Maynganay Sur", "Nagsayaoan", "Nalidaoan", "Nutia", "Pacang", "Parioc 1st", "Parioc 2nd", "Penned", "Poblacion Norte", "Poblacion Sur", "San Alejandro", "San Gelacio", "San Pedro", "Silag", "Suso", "Tangaoan"],
  "Santiago": ["Al-alinao Norte", "Al-alinao Sur", "Ambugat", "Bayo", "Bigbiga", "Binacud", "Bucyao", "Bulbulala", "Buso-buso", "Butol", "Caburao", "Danuman East", "Danuman West", "Dinwede East", "Dinwede West", "Gabay", "Imus", "Lang-ayan", "Mambug", "Olo-olo Norte", "Olo-olo Sur", "Poblacion Norte", "Poblacion Sur", "Sabanen", "Salcedo", "San Jose", "San Roque", "San Vicente", "Ubbog"],
  "Santo Domingo": ["Binalayangan", "Borobor", "Cabigbigaan", "Cabusligan", "Calay-ab", "Camragan", "Casili", "Flora", "Lagatit", "Laoingen", "Lussoc", "Nalasin", "Nagbettedan", "Naglaoa-an", "Pangalisan", "Panay", "Pussuac", "Quimmarayan", "San Pablo", "Santa Clara", "Suksukit", "Suso", "Vacunero"],
  "Sigay": ["Abquilan", "Mabileg", "Poblacion", "San Elias"],
  "Sinait": ["Aguing", "Ballaigui", "Baracbac", "Barikir", "Battao", "Cabaritan", "Cabisilan", "Calanutian", "Calingayan", "Concepcion", "Dean Leopoldo Yabes", "Dadao", "Dadalaquiten Norte", "Dadalaquiten Sur", "Duyay-ayat", "Jordan", "Katipunan", "Macabiag", "Magsaysay", "Marnay", "Masical", "Nagbalioartian", "Nagcullooban", "Naglumpa-an", "Nagmullocan", "Namnama", "Pacis", "Paratong", "Poblacion", "Purag", "Quibit-quibit", "Quimmallogong", "Ricudo", "Sabangan", "Sallacapo", "Santa Cruz", "Sapriana", "Tapao", "Teppeng", "Tubigay", "Ubbog"],
  "Sugpon": ["Balbalayang", "Bangabanga", "Danac", "Pangotan", "Poblacion", "Uguid"],
  "Suyo": ["Baringcucurong", "Cabcaburao", "Man-atong", "Patoc-ao", "Poblacion", "Suyo Proper", "Urzadan", "Uso"],
  "Tagudin": ["Ag-aguman", "Al-alinao", "Ambalayat", "Baracbac", "Bariw", "Baroro", "Basca", "Bitalag", "Borono", "Bucao", "Cabaniguan", "Cabaroan", "Caburlaoan", "Cantoria", "Concepcion", "Dada Norte", "Dada Sur", "Del Pilar", "Farig", "Gari Norte", "Gari Sur", "Las-ud", "Lapting", "Libtong", "Lubnac", "Magsaysay", "Malacañang", "Mariposa", "Miguel", "Padua", "Pallogan", "Paratong", "Quirino", "Rizal", "Salcedo", "San Antonio", "San Isidro", "San Juan", "San Jose", "San Rafael", "San Vicente", "Sarmingan", "Tambidao", "Tampugo", "Tarangotong"],
  "Vigan City": ["Ayusan Norte", "Ayusan Sur", "Barangay I", "Barangay II", "Barangay III", "Barangay IV", "Barangay V", "Barangay VI", "Barraca", "Beddeng Laud", "Beddeng Daya", "Bongtolan", "Bulala", "Cabalangegan", "Cabaroan Daya", "Cabaroan Laud", "Camangaan", "Capangpangan", "Mindoro", "Nagsangalan", "Pantay Daya", "Pantay Fatima", "Pantay Laud", "Paoa", "Paratong", "Pong-ol", "Purok-a-bassit", "Purok-a-dakkel", "Raois", "Rugsuanan", "Salindeg", "San Jose", "San Julian Norte", "San Julian Sur", "San Pedro", "Santa Elena", "Tamag"]
};

const FILTER_FEATURES: { key: string; name: string; icon: string }[] = [
  { key: 'road',        name: 'Main Road',      icon: 'road-variant' },
  { key: 'hospital',    name: 'Hospital',        icon: 'hospital-building' },
  { key: 'school',      name: 'School',          icon: 'school' },
  { key: 'store',       name: 'Market',          icon: 'store' },
  { key: 'beach',       name: 'Beach Spot',      icon: 'beach' },
  { key: 'shopping',    name: 'Mall Nearby',     icon: 'shopping' },
  { key: 'parking',     name: 'Parking',         icon: 'parking' },
  { key: 'church',      name: 'Church/Chapel',   icon: 'church' },
  { key: 'transport',   name: 'Transport Hub',   icon: 'bus-stop' },
  { key: 'nature',      name: 'Nature/Park',     icon: 'nature-people' },
  { key: 'restaurant',  name: 'Restaurant',      icon: 'food-fork-drink' },
  { key: 'gas_station', name: 'Gas Station',     icon: 'gas-station' },
  { key: 'gated',       name: 'Gated Community', icon: 'gate' },
  { key: 'wifi',        name: 'Fiber/Internet',  icon: 'wifi' },
  { key: 'mountain',    name: 'Mountain View',   icon: 'image-filter-hdr' },
];

const FILTER_AMENITIES: { key: string; name: string; icon: string }[] = [
  { key: 'pool',            name: 'Swimming Pool',   icon: 'pool' },
  { key: 'gym',             name: 'Gym',             icon: 'dumbbell' },
  { key: 'security',        name: '24/7 Security',   icon: 'shield-check' },
  { key: 'elevator',        name: 'Elevator',        icon: 'elevator' },
  { key: 'cctv',            name: 'CCTV',            icon: 'cctv' },
  { key: 'water',           name: 'Water System',    icon: 'water-pump' },
  { key: 'solar',           name: 'Solar Power',     icon: 'solar-panel' },
  { key: 'garden',          name: 'Garden/Yard',     icon: 'tree' },
  { key: 'balcony',         name: 'Balcony',         icon: 'balcony' },
  { key: 'covered_parking', name: 'Covered Parking', icon: 'garage' },
];

// ─── Dual-handle Range Slider ────────────────────────────────────────────────
const THUMB = 26;

interface RangeSliderProps {
  min: number; max: number; step: number;
  low: number; high: number;
  onLowChange: (v: number) => void;
  onHighChange: (v: number) => void;
}

function RangeSlider({ min, max, step, low, high, onLowChange, onHighChange }: RangeSliderProps) {
  const [trackWidth, setTrackWidth] = useState(0);

  // Always-fresh refs — accessible inside responder closures without stale closure issues
  const twRef   = useRef(0);   // trackWidth
  const lowRef  = useRef(low);
  const highRef = useRef(high);
  useEffect(() => { lowRef.current  = low;  }, [low]);
  useEffect(() => { highRef.current = high; }, [high]);

  const snap  = (v: number) => Math.round(v / step) * step;
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

  const pxFromVal = (v: number) =>
    twRef.current === 0 ? 0 : ((v - min) / (max - min)) * twRef.current;

  const valFromOffset = (offsetPx: number) =>
    snap(clamp(min + (offsetPx / twRef.current) * (max - min), min, max));

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    twRef.current = w;
    setTrackWidth(w);
  };

  // Per-thumb drag state
  const startPageXRef = useRef(0);
  const startValRef   = useRef(0);

  const makeThumHandlers = (thumb: 'low' | 'high') => ({
    onStartShouldSetResponder: () => true,
    onMoveShouldSetResponder:  () => true,
    onResponderGrant: (e: any) => {
      startPageXRef.current = e.nativeEvent.pageX;
      startValRef.current   = thumb === 'low' ? lowRef.current : highRef.current;
    },
    onResponderMove: (e: any) => {
      if (!twRef.current) return;
      const dx      = e.nativeEvent.pageX - startPageXRef.current;
      const startPx = pxFromVal(startValRef.current);
      const newVal  = valFromOffset(startPx + dx);
      if (thumb === 'low') {
        onLowChange(clamp(newVal, min, highRef.current - step));
      } else {
        onHighChange(clamp(newVal, lowRef.current + step, max));
      }
    },
    onResponderRelease:   () => {},
    onResponderTerminate: () => {},
  });

  const lowHandlers  = makeThumHandlers('low');
  const highHandlers = makeThumHandlers('high');

  const lowPx  = pxFromVal(low);
  const highPx = pxFromVal(high);
  const TRACK_H = 6;
  const CONTAINER_H = THUMB + 12;
  const trackTop = (CONTAINER_H - TRACK_H) / 2;
  const thumbTop = (CONTAINER_H - THUMB) / 2;

  return (
    <View style={{ paddingHorizontal: THUMB / 2 }}>
      <View
        onLayout={onLayout}
        style={{ height: CONTAINER_H, position: 'relative' }}
      >
        {/* Track background */}
        <View style={{
          position: 'absolute', left: 0, right: 0,
          top: trackTop, height: TRACK_H,
          backgroundColor: '#e5e7eb', borderRadius: 3,
        }} />

        {/* Active fill */}
        {trackWidth > 0 && (
          <View style={{
            position: 'absolute',
            left: lowPx, width: Math.max(0, highPx - lowPx),
            top: trackTop, height: TRACK_H,
            backgroundColor: '#2563eb', borderRadius: 3,
          }} />
        )}

        {/* Low thumb */}
        {trackWidth > 0 && (
          <View
            {...lowHandlers}
            style={[sl.thumb, { position: 'absolute', left: lowPx - THUMB / 2, top: thumbTop }]}
          >
            <View style={sl.inner} />
          </View>
        )}

        {/* High thumb */}
        {trackWidth > 0 && (
          <View
            {...highHandlers}
            style={[sl.thumb, { position: 'absolute', left: highPx - THUMB / 2, top: thumbTop }]}
          >
            <View style={sl.inner} />
          </View>
        )}
      </View>
    </View>
  );
}

const sl = StyleSheet.create({
  thumb: {
    width: THUMB, height: THUMB, borderRadius: THUMB / 2,
    backgroundColor: '#fff', borderWidth: 2.5, borderColor: '#2563eb',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, elevation: 5,
    cursor: 'grab' as any,
    userSelect: 'none' as any,
  },
  inner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2563eb' },
});

// ─── Numeric Input ────────────────────────────────────────────────────────────
interface NumInputProps {
  label: string; value: number;
  min: number; max: number;
  formatDisplay: (v: number) => string;
  parseInput: (s: string) => number;
  onChange: (v: number) => void;
}

function NumInput({ label, value, min, max, formatDisplay, parseInput, onChange }: NumInputProps) {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState('');

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 11, color: '#6b7280', marginBottom: 4, fontWeight: '500' }}>{label}</Text>
      <TextInput
        style={{
          borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8,
          paddingHorizontal: 10, paddingVertical: Platform.OS === 'web' ? 6 : 10,
          fontSize: 14, color: '#111827', backgroundColor: '#f9fafb',
          fontWeight: '600', textAlign: 'center',
        }}
        value={editing ? raw : formatDisplay(value)}
        onFocus={() => { setEditing(true); setRaw(String(value)); }}
        onBlur={() => {
          setEditing(false);
          const n = parseInput(raw);
          if (!isNaN(n)) onChange(Math.max(min, Math.min(max, n)));
        }}
        onChangeText={setRaw}
        keyboardType="numeric"
        selectTextOnFocus
      />
    </View>
  );
}

// ─── Filter Modal ─────────────────────────────────────────────────────────────
export function FilterModal({ visible, onClose, filters, setFilters }: FilterModalProps) {
  const { width, height } = useWindowDimensions();
  const isWebDesktop = width >= 1024 && Platform.OS === 'web';
  const [localFilters, setLocalFilters] = useState<FilterState>({ features: [], amenities: [], ...filters });
  const [bounds, setBounds] = useState({ maxPrice: 100_000_000, maxLotArea: 5000 });

  useEffect(() => {
    if (!visible) return;
    setLocalFilters({ features: [], amenities: [], ...filters });
    getPropertyBounds().then((res) => {
      if (!res.ok) return;
      const b = res.data;
      setBounds(b);
      setLocalFilters((prev) => ({
        ...prev,
        maxPrice: prev.maxPrice === 0 && prev.minPrice === 0 ? b.maxPrice : (prev.maxPrice || b.maxPrice),
        maxArea:  prev.maxArea  === 0 && prev.minArea  === 0 ? b.maxLotArea : (prev.maxArea  || b.maxLotArea),
      }));
    });
  }, [visible, filters]);

  const toggle = (key: 'type' | 'status' | 'features' | 'amenities', value: string) =>
    setLocalFilters((prev) => {
      const arr = prev[key];
      return { ...prev, [key]: arr.includes(value) ? arr.filter((i) => i !== value) : [...arr, value] };
    });

  const clearFilters = () =>
    setLocalFilters({ type: [], status: [], features: [], amenities: [], minPrice: 0, maxPrice: bounds.maxPrice, city: '', barangay: '', minArea: 0, maxArea: bounds.maxLotArea });

  const handleApply = () => { setFilters(localFilters); onClose(); };

  const fmt = (v: number) => {
    if (v >= 1_000_000) return `₱${(v / 1_000_000).toFixed(2)}M`;
    if (v >= 1_000)     return `₱${(v / 1_000).toFixed(0)}k`;
    return `₱${v}`;
  };
  const parseMoney = (s: string) => {
    const c = s.replace(/[₱,\s]/g, '').toLowerCase();
    if (c.endsWith('m')) return parseFloat(c) * 1_000_000;
    if (c.endsWith('k')) return parseFloat(c) * 1_000;
    return parseFloat(c);
  };

  const propertyTypes = ['LOT', 'HOUSE', 'CONDO', 'COMMERCIAL'];
  const statusOptions = ['AVAILABLE', 'SOLD', 'RESERVED'];

  const modalContent = (
    <View style={[
      { backgroundColor: 'white' },
      isWebDesktop
        ? { borderRadius: 24, width: '100%', maxWidth: 512, alignSelf: 'center', overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, maxHeight: height * 0.82 }
        : { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: height * 0.85 },
    ]}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-800">Filters</Text>
        <Pressable onPress={onClose} className="p-2 bg-gray-100 rounded-full">
          <Feather name="x" size={24} color="#374151" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 16 }} showsVerticalScrollIndicator={false}>

        {/* City & Barangay */}
        <View className="mb-6 flex-row" style={{ gap: 16 }}>
          <View style={{ flex: 1 }}>
            <Text className="text-base font-semibold text-gray-700 mb-3">City / Municipality</Text>
            <Dropdown
              style={{
                  height: 50,
                  backgroundColor: '#ffffff',
                  borderColor: '#d1d5db',
                  borderWidth: 1,
                  borderRadius: 8,
                  paddingHorizontal: 16,
              }}
              placeholderStyle={{ color: '#6b7280', fontSize: 15 }}
              selectedTextStyle={{ color: '#374151', fontSize: 15 }}
              inputSearchStyle={{
                  height: 44,
                  fontSize: 15,
                  color: '#374151',
                  backgroundColor: '#f9fafb',
                  borderColor: '#e5e7eb',
                  borderRadius: 8
              }}
              iconStyle={{ width: 22, height: 22, tintColor: '#6b7280' }}
              data={[
                { label: 'All Cities', value: '' },
                ...Object.keys(ILOCOS_SUR_LOCATIONS).sort().map(c => ({ label: c, value: c }))
              ]}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="All Cities"
              searchPlaceholder="Search city..."
              value={localFilters.city}
              onChange={item => {
                  setLocalFilters({ ...localFilters, city: item.value, barangay: '' });
              }}
              containerStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: 8, overflow: 'hidden' }}
              itemTextStyle={{ color: '#374151' }}
              activeColor={'#f3f4f6'}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text className="text-base font-semibold text-gray-700 mb-3">Barangay</Text>
            <Dropdown
              style={{
                  height: 50,
                  backgroundColor: !localFilters.city ? '#f3f4f6' : '#ffffff',
                  borderColor: '#d1d5db',
                  borderWidth: 1,
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  opacity: !localFilters.city ? 0.7 : 1
              }}
              placeholderStyle={{ color: '#6b7280', fontSize: 15 }}
              selectedTextStyle={{ color: '#374151', fontSize: 15 }}
              inputSearchStyle={{
                  height: 44,
                  fontSize: 15,
                  color: '#374151',
                  backgroundColor: '#f9fafb',
                  borderColor: '#e5e7eb',
                  borderRadius: 8
              }}
              iconStyle={{ width: 22, height: 22, tintColor: '#6b7280' }}
              data={localFilters.city ? [
                { label: 'All Barangays', value: '' },
                ...ILOCOS_SUR_LOCATIONS[localFilters.city]?.map(b => ({ label: b, value: b }))
              ] : []}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={localFilters.city ? "All Barangays" : "Select City First"}
              searchPlaceholder="Search barangay..."
              value={localFilters.barangay}
              onChange={item => {
                  setLocalFilters({ ...localFilters, barangay: item.value });
              }}
              disable={!localFilters.city}
              containerStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: 8, overflow: 'hidden' }}
              itemTextStyle={{ color: '#374151' }}
              activeColor={'#f3f4f6'}
            />
          </View>
        </View>

        {/* Nearby Features */}
        <View className="mb-6">
          <View className="flex-row items-center mb-3">
            <Text className="text-base font-semibold text-gray-700 flex-1">Nearby Features</Text>
            {localFilters.features.length > 0 && (
              <Pressable onPress={() => setLocalFilters((p) => ({ ...p, features: [] }))}>
                <Text style={{ fontSize: 12, color: '#2563eb', fontWeight: '500' }}>Clear</Text>
              </Pressable>
            )}
          </View>
          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            {FILTER_FEATURES.map((f) => {
              const active = localFilters.features.includes(f.key);
              return (
                <Pressable
                  key={f.key}
                  onPress={() => toggle('features', f.key)}
                  style={[
                    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1 },
                    active
                      ? { backgroundColor: '#2563eb', borderColor: '#2563eb' }
                      : { backgroundColor: '#fff', borderColor: '#d1d5db' },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={f.icon as any}
                    size={13}
                    color={active ? '#fff' : '#6b7280'}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={{ fontSize: 13, fontWeight: active ? '600' : '400', color: active ? '#fff' : '#374151' }}>
                    {f.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Amenities */}
        <View className="mb-6">
          <View className="flex-row items-center mb-3">
            <Text className="text-base font-semibold text-gray-700 flex-1">Amenities</Text>
            {localFilters.amenities.length > 0 && (
              <Pressable onPress={() => setLocalFilters((p) => ({ ...p, amenities: [] }))}>
                <Text style={{ fontSize: 12, color: '#2563eb', fontWeight: '500' }}>Clear</Text>
              </Pressable>
            )}
          </View>
          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            {FILTER_AMENITIES.map((a) => {
              const active = localFilters.amenities.includes(a.key);
              return (
                <Pressable
                  key={a.key}
                  onPress={() => toggle('amenities', a.key)}
                  style={[
                    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1 },
                    active
                      ? { backgroundColor: '#2563eb', borderColor: '#2563eb' }
                      : { backgroundColor: '#fff', borderColor: '#d1d5db' },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={a.icon as any}
                    size={13}
                    color={active ? '#fff' : '#6b7280'}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={{ fontSize: 13, fontWeight: active ? '600' : '400', color: active ? '#fff' : '#374151' }}>
                    {a.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Property Type */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-gray-700 mb-3">Property Type</Text>
          <View className="flex-row flex-wrap gap-2">
            {propertyTypes.map((t) => (
              <Pressable key={t} onPress={() => toggle('type', t)}
                className={`px-4 py-2 rounded-full border ${localFilters.type.includes(t) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                <Text className={localFilters.type.includes(t) ? 'text-white font-medium' : 'text-gray-600'}>{t}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Status */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-gray-700 mb-3">Status</Text>
          <View className="flex-row flex-wrap gap-2">
            {statusOptions.map((s) => (
              <Pressable key={s} onPress={() => toggle('status', s)}
                className={`px-4 py-2 rounded-full border ${localFilters.status.includes(s) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                <Text className={localFilters.status.includes(s) ? 'text-white font-medium' : 'text-gray-600'}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Price Range */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-semibold text-gray-700">Price Range</Text>
            <Text className="text-sm font-semibold text-blue-600">{fmt(localFilters.minPrice)} – {fmt(localFilters.maxPrice)}</Text>
          </View>
          <RangeSlider
            min={0} max={bounds.maxPrice} step={100_000}
            low={localFilters.minPrice} high={localFilters.maxPrice}
            onLowChange={(v) => setLocalFilters((p) => ({ ...p, minPrice: v, maxPrice: v > p.maxPrice ? v : p.maxPrice }))}
            onHighChange={(v) => setLocalFilters((p) => ({ ...p, maxPrice: v, minPrice: v < p.minPrice ? v : p.minPrice }))}
          />
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            <NumInput label="Min Price" value={localFilters.minPrice} min={0} max={localFilters.maxPrice}
              formatDisplay={fmt} parseInput={parseMoney}
              onChange={(v) => setLocalFilters((p) => ({ ...p, minPrice: Math.min(v, p.maxPrice) }))} />
            <NumInput label="Max Price" value={localFilters.maxPrice} min={localFilters.minPrice} max={bounds.maxPrice}
              formatDisplay={fmt} parseInput={parseMoney}
              onChange={(v) => setLocalFilters((p) => ({ ...p, maxPrice: Math.max(v, p.minPrice) }))} />
          </View>
        </View>

        {/* Lot Area Range */}
        <View className="mb-10">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-semibold text-gray-700">Lot Area Range</Text>
            <Text className="text-sm font-semibold text-blue-600">{localFilters.minArea} – {localFilters.maxArea} sqm</Text>
          </View>
          <RangeSlider
            min={0} max={bounds.maxLotArea} step={10}
            low={localFilters.minArea} high={localFilters.maxArea}
            onLowChange={(v) => setLocalFilters((p) => ({ ...p, minArea: v, maxArea: v > p.maxArea ? v : p.maxArea }))}
            onHighChange={(v) => setLocalFilters((p) => ({ ...p, maxArea: v, minArea: v < p.minArea ? v : p.minArea }))}
          />
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            <NumInput label="Min Area (sqm)" value={localFilters.minArea} min={0} max={localFilters.maxArea}
              formatDisplay={(v) => `${v}`} parseInput={(s) => parseFloat(s.replace(/[^\d.]/g, ''))}
              onChange={(v) => setLocalFilters((p) => ({ ...p, minArea: Math.min(v, p.maxArea) }))} />
            <NumInput label="Max Area (sqm)" value={localFilters.maxArea} min={localFilters.minArea} max={bounds.maxLotArea}
              formatDisplay={(v) => `${v}`} parseInput={(s) => parseFloat(s.replace(/[^\d.]/g, ''))}
              onChange={(v) => setLocalFilters((p) => ({ ...p, maxArea: Math.max(v, p.minArea) }))} />
          </View>
        </View>

      </ScrollView>

      {/* Footer */}
      <View className="p-6 border-t border-gray-200 bg-white flex-row gap-4">
        <Pressable onPress={clearFilters} className="flex-1 py-4 border border-gray-300 rounded-xl items-center justify-center">
          <Text className="text-gray-700 font-semibold text-base">Reset</Text>
        </Pressable>
        <Pressable onPress={handleApply} className="flex-1 py-4 bg-blue-600 rounded-xl items-center justify-center">
          <Text className="text-white font-semibold text-base">Apply Filters</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType={isWebDesktop ? 'fade' : 'slide'} transparent onRequestClose={onClose}>
      <View className={`flex-1 ${isWebDesktop ? 'justify-center items-center p-4' : 'justify-end'}`}>
        <Pressable style={StyleSheet.absoluteFillObject} className="bg-black/50" onPress={onClose} />
        <Pressable className={isWebDesktop ? 'w-full max-w-lg' : 'w-full'} onPress={(e) => e.stopPropagation()}>
          {modalContent}
        </Pressable>
      </View>
    </Modal>
  );
}

export default function FilterModalRouteStub(): null { return null; }
