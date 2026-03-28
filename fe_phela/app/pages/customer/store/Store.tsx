import React, { useState, useEffect } from 'react';
import Header from '~/components/customer/Header'
import Footer from '~/components/customer/Footer'
import imgStore from "~/assets/images/store.png"
import { getPublicBranches } from '~/services/branchService';

interface Branch {
  branchCode: string;
  branchName: string;
  latitude: number;
  longitude: number;
  city: string;
  district: string;
  address: string;
  status: string;
}

const Store = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const branchesData = await getPublicBranches();
        setBranches(branchesData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching branches:', error);
        setLoading(false);
      }
    };
    fetchBranches();
  }, []);

  const groupedByCity = branches.reduce<Record<string, Record<string, Branch[]>>>((acc, branch) => {
    const { city, district } = branch;
    if (!acc[city]) {
      acc[city] = {};
    }
    if (!acc[city][district]) {
      acc[city][district] = [];
    }
    acc[city][district].push(branch);
    return acc;
  }, {});

  const handleBranchClick = (branch: Branch) => {
    setSelectedBranch(branch);
  };

  const closeMap = () => {
    setSelectedBranch(null);
  };

  const mapUrl = selectedBranch 
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${selectedBranch.longitude-0.01},${selectedBranch.latitude-0.01},${selectedBranch.longitude+0.01},${selectedBranch.latitude+0.01}&layer=mapnik&marker=${selectedBranch.latitude},${selectedBranch.longitude}`
    : '';

  return (
    <div className="relative">
      {/* Map Overlay */}
      {selectedBranch && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
          <div className="bg-[#1f120b] mx-4 max-w-4xl w-full rounded-lg border border-[#3d1d11] shadow-2xl text-white">
            <div className="flex justify-between items-center p-4 border-b border-[#3d1d11]">
              <h3 className="text-xl font-bold text-[#d48437]">{selectedBranch.branchName}</h3>
              <button
                onClick={closeMap}
                className="text-white/60 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <p className="mb-4">{selectedBranch.address}</p>
              <iframe
                src={mapUrl}
                width="100%"
                height="400px"
                style={{ border: 0 }}
                loading="lazy"
                title={`Bản đồ ${selectedBranch.branchName}`}
              />
              <div className="mt-4 flex gap-3">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedBranch.latitude},${selectedBranch.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Chỉ đường bằng Google Maps
                </a>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${selectedBranch.latitude}&mlon=${selectedBranch.longitude}#map=16/${selectedBranch.latitude}/${selectedBranch.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  Chỉ đường bằng OpenStreetMap
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={selectedBranch ? 'blur-sm' : ''}>
        <div className="fixed top-0 left-0 w-full bg-[#1f120b] shadow-md z-50">
          <Header />
        </div>
        
        {/* Banner */}
        <div className="relative w-full h-72 mt-14">
          <img
            src={imgStore}
            alt="Phong cách khác biệt"
            className="w-full h-72 object-cover brightness-75"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-4xl font-bold uppercase text-white text-center drop-shadow-lg">
              HỆ THỐNG CỬA HÀNG
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 text-white">
          <h1 className="text-3xl font-black mb-8 text-center text-[#d48437]">HỆ THỐNG CỬA HÀNG</h1>
          {loading ? (
            <p className="text-center text-white/60">Đang tải...</p>
          ) : (
            <div className="item_store_li">
              {Object.entries(groupedByCity).map(([city, districts]) => (
                <div key={city} className="mb-10 gap-6">
                  <h2 className="text-2xl font-bold text-center mb-10 pb-2 border-b border-[#3d1d11] inline-block w-full">{city}</h2>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                    {Object.entries(districts).map(([district, branches]) => (
                      <div key={district} className="bg-[#1f120b] p-6 rounded-2xl border border-[#3d1d11] shadow-xl hover:border-[#d48437]/30 transition-all">
                        <h3 className="text-xl font-bold text-[#d48437] mb-5 flex items-center gap-2">
                          <span className="w-2 h-2 bg-[#d48437] rounded-full"></span>
                          {district}
                        </h3>
                        <div className="space-y-6">
                          {branches.map((branch) => (
                            <div key={branch.branchCode} className="flex items-start group">
                              <span className="text-[#d48437] mr-3 mt-1 text-lg">📍</span>
                              <div className="flex-1">
                                <button
                                  onClick={() => handleBranchClick(branch)}
                                  className="text-white font-bold hover:text-[#d48437] transition-colors cursor-pointer bg-transparent border-none p-0 text-left mb-1 block w-full"
                                >
                                  {branch.branchName}
                                </button>
                                <p className="text-white/70 text-sm leading-relaxed">{branch.address}</p>
                                <p className="text-[#d48437]/80 text-xs mt-2 font-medium">Hotline: 1900 3013</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Store;