import { useState } from "react";
import { Search, Filter, Truck } from "lucide-react";
import VehicleCard from "./VehicleCard";

const VehicleList = ({ vehicles, onDeleteVehicle }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCapacity, setFilterCapacity] = useState("");

    const filteredVehicles = vehicles.filter((vehicle) => {
        const matchesSearch = vehicle.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesCapacity =
            !filterCapacity || vehicle.capacityKg >= parseInt(filterCapacity);
        return matchesSearch && matchesCapacity;
    });

    return (
        <div>
            {/* Search and Filter */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search vehicles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <select
                        value={filterCapacity}
                        onChange={(e) => setFilterCapacity(e.target.value)}
                        className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                        <option value="">All Capacities</option>
                        <option value="500">500kg+</option>
                        <option value="1000">1000kg+</option>
                        <option value="1500">1500kg+</option>
                    </select>
                </div>
            </div>

            {/* Vehicle Grid */}
            {filteredVehicles.length === 0 ? (
                <div className="text-center py-12">
                    <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                        {vehicles.length === 0
                            ? "No vehicles found. Add your first vehicle to get started."
                            : "No vehicles match your search criteria."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVehicles.map((vehicle) => (
                        <VehicleCard
                            key={vehicle._id}
                            vehicle={vehicle}
                            onDelete={onDeleteVehicle}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default VehicleList;
