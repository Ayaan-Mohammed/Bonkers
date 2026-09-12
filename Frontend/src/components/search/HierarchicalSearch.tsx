import React, { useState } from 'react';
import { ArrowRight, Search, Map } from 'lucide-react';
import { Button } from '@/components/common/Button';

export interface HierarchicalSearchProps {
  onSearch: (params: {
    state?: string;
    district?: string;
    village?: string;
    query?: string;
  }) => void;
  isLoading?: boolean;
}

interface AdminState {
  code: string;
  name: string;
  districts: {
    name: string;
    talukas: {
      name: string;
      villages: string[];
    }[];
  }[];
}

const ADMIN_DATA: AdminState[] = [
  {
    code: 'UP',
    name: 'Uttar Pradesh',
    districts: [
      {
        name: 'Lucknow',
        talukas: [
          {
            name: 'Lucknow Sadar',
            villages: ['Chinhat', 'Alambagh', 'Gomti Nagar', 'Bakshi Ka Talab'],
          },
        ],
      },
      {
        name: 'Varanasi',
        talukas: [
          {
            name: 'Varanasi Sadar',
            villages: ['Shivpur', 'Ramnagar'],
          },
        ],
      },
    ],
  },
  {
    code: 'MH',
    name: 'Maharashtra',
    districts: [
      {
        name: 'Mumbai',
        talukas: [
          {
            name: 'Andheri',
            villages: ['Andheri (W)', 'Bandra', 'Juhu', 'Kurla'],
          },
        ],
      },
      {
        name: 'Pune',
        talukas: [
          {
            name: 'Haveli',
            villages: ['Shivajinagar', 'Kothrud'],
          },
        ],
      },
    ],
  },
  {
    code: 'KA',
    name: 'Karnataka',
    districts: [
      {
        name: 'Bengaluru Urban',
        talukas: [
          {
            name: 'Bangalore South',
            villages: ['Koramangala', 'Indiranagar', 'Jayanagar', 'Whitefield'],
          },
        ],
      },
      {
        name: 'Mysuru',
        talukas: [
          {
            name: 'Mysuru Taluk',
            villages: ['Chamundi Hill', 'Jayalakshmipuram'],
          },
        ],
      },
    ],
  },
  {
    code: 'TN',
    name: 'Tamil Nadu',
    districts: [
      {
        name: 'Chennai',
        talukas: [
          {
            name: 'Guindy',
            villages: ['T. Nagar', 'Mylapore', 'Adyar', 'Velachery'],
          },
        ],
      },
    ],
  },
  {
    code: 'TS',
    name: 'Telangana',
    districts: [
      {
        name: 'Hyderabad',
        talukas: [
          {
            name: 'Serilingampally',
            villages: ['Serilingampally', 'Gachibowli', 'Madhapur'],
          },
        ],
      },
      {
        name: 'Rangareddy',
        talukas: [
          {
            name: 'Rajendranagar',
            villages: ['Shamshabad', 'Attapur'],
          },
        ],
      },
      {
        name: 'Jangaon',
        talukas: [
          {
            name: 'Jangaon Mandal',
            villages: ['Pembarthi', 'Jangaon', 'Shamirpet', 'Yeshwanthapur'],
          },
          {
            name: 'Station Ghanpur',
            villages: ['Station Ghanpur', 'Shivunipalle', 'Chaggal'],
          },
          {
            name: 'Palakurthi',
            villages: ['Palakurthi', 'Valmidi'],
          },
        ],
      },
    ],
  },
];

export const HierarchicalSearch: React.FC<HierarchicalSearchProps> = ({
  onSearch,
  isLoading = false,
}) => {
  const [selectedStateCode, setSelectedStateCode] = useState('UP');
  const [selectedDistrict, setSelectedDistrict] = useState('Lucknow');
  const [selectedTaluka, setSelectedTaluka] = useState('Lucknow Sadar');
  const [selectedVillage, setSelectedVillage] = useState('Chinhat');
  const [plotNumber, setPlotNumber] = useState('');

  const currentState = ADMIN_DATA.find((s) => s.code === selectedStateCode);
  const currentDistrict = currentState?.districts.find((d) => d.name === selectedDistrict);
  const currentTaluka = currentDistrict?.talukas.find((t) => t.name === selectedTaluka);

  const handleStateChange = (code: string) => {
    setSelectedStateCode(code);
    const newState = ADMIN_DATA.find((s) => s.code === code);
    const newDistrict = newState?.districts[0]?.name || '';
    setSelectedDistrict(newDistrict);
    const newTaluka = newState?.districts[0]?.talukas[0]?.name || '';
    setSelectedTaluka(newTaluka);
    const newVillage = newState?.districts[0]?.talukas[0]?.villages[0] || '';
    setSelectedVillage(newVillage);
  };

  const handleDistrictChange = (districtName: string) => {
    setSelectedDistrict(districtName);
    const dist = currentState?.districts.find((d) => d.name === districtName);
    const newTaluka = dist?.talukas[0]?.name || '';
    setSelectedTaluka(newTaluka);
    const newVillage = dist?.talukas[0]?.villages[0] || '';
    setSelectedVillage(newVillage);
  };

  const handleTalukaChange = (talukaName: string) => {
    setSelectedTaluka(talukaName);
    const tal = currentDistrict?.talukas.find((t) => t.name === talukaName);
    setSelectedVillage(tal?.villages[0] || '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      state: selectedStateCode,
      district: selectedDistrict,
      village: selectedVillage,
      query: plotNumber.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. State Dropdown */}
        <div>
          <label
            htmlFor="hier-state"
            className="block text-xs font-mono text-nlip-text-soft mb-1.5 uppercase tracking-wider"
          >
            1. State / UT
          </label>
          <select
            id="hier-state"
            value={selectedStateCode}
            onChange={(e) => handleStateChange(e.target.value)}
            className="w-full h-11 px-3 py-2 bg-[#1c1813] border border-nlip-border rounded-nlip-sm text-sm text-nlip-text focus:outline-none focus:border-nlip-amber transition-colors cursor-pointer"
          >
            {ADMIN_DATA.map((s) => (
              <option key={s.code} value={s.code} className="bg-[#1c1813]">
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        {/* 2. District Dropdown */}
        <div>
          <label
            htmlFor="hier-district"
            className="block text-xs font-mono text-nlip-text-soft mb-1.5 uppercase tracking-wider"
          >
            2. District
          </label>
          <select
            id="hier-district"
            value={selectedDistrict}
            onChange={(e) => handleDistrictChange(e.target.value)}
            disabled={!currentState}
            className="w-full h-11 px-3 py-2 bg-[#1c1813] border border-nlip-border rounded-nlip-sm text-sm text-nlip-text focus:outline-none focus:border-nlip-amber transition-colors cursor-pointer disabled:opacity-40"
          >
            {currentState?.districts.map((d) => (
              <option key={d.name} value={d.name} className="bg-[#1c1813]">
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Taluka / Tehsil Dropdown */}
        <div>
          <label
            htmlFor="hier-taluka"
            className="block text-xs font-mono text-nlip-text-soft mb-1.5 uppercase tracking-wider"
          >
            3. Taluka / Tehsil
          </label>
          <select
            id="hier-taluka"
            value={selectedTaluka}
            onChange={(e) => handleTalukaChange(e.target.value)}
            disabled={!currentDistrict}
            className="w-full h-11 px-3 py-2 bg-[#1c1813] border border-nlip-border rounded-nlip-sm text-sm text-nlip-text focus:outline-none focus:border-nlip-amber transition-colors cursor-pointer disabled:opacity-40"
          >
            {currentDistrict?.talukas.map((t) => (
              <option key={t.name} value={t.name} className="bg-[#1c1813]">
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Village Dropdown */}
        <div>
          <label
            htmlFor="hier-village"
            className="block text-xs font-mono text-nlip-text-soft mb-1.5 uppercase tracking-wider"
          >
            4. Village / Ward
          </label>
          <select
            id="hier-village"
            value={selectedVillage}
            onChange={(e) => setSelectedVillage(e.target.value)}
            disabled={!currentTaluka}
            className="w-full h-11 px-3 py-2 bg-[#1c1813] border border-nlip-border rounded-nlip-sm text-sm text-nlip-text focus:outline-none focus:border-nlip-amber transition-colors cursor-pointer disabled:opacity-40"
          >
            {currentTaluka?.villages.map((v) => (
              <option key={v} value={v} className="bg-[#1c1813]">
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Plot Number & Search Button */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <div className="flex-1">
          <label
            htmlFor="hier-plot"
            className="block text-xs font-mono text-nlip-text-soft mb-1.5 uppercase tracking-wider"
          >
            Survey / Plot / Khasra No. (Optional filter)
          </label>
          <input
            id="hier-plot"
            type="text"
            value={plotNumber}
            onChange={(e) => setPlotNumber(e.target.value)}
            placeholder="e.g. 412/601, K-2234, 83/05 (leave blank to list all in village)"
            className="w-full h-11 px-3.5 bg-[#1c1813] border border-nlip-border rounded-nlip-sm text-sm font-mono text-nlip-text placeholder:text-nlip-text-faint focus:outline-none focus:border-nlip-amber transition-colors"
          />
        </div>

        <div className="sm:self-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            icon={<Search className="w-4 h-4" />}
            iconRight={<ArrowRight className="w-4 h-4" />}
            className="w-full sm:w-auto h-11"
          >
            Search Village Records
          </Button>
        </div>
      </div>
    </form>
  );
};
