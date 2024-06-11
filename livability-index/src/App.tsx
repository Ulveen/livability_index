import './App.css';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import indonesiaTopoJson from './assets/provinces-simplified-topo.json';
import { useEffect, useState } from 'react';
import Hovered from './elements/hoveredInfo';
import DataTable from 'react-data-table-component';
import { read_csv } from './utils/csv_utils';
import { predict } from './controller/kmedoids_controller';
import { LivabilityIndex } from './model/livabilityIndex';
import LivabilityBarchart from './elements/livabilityBarChart';
import { columns } from './model/tableColumns';

export default function App() {
  const [data, setData] = useState<LivabilityIndex[]>([]);
  const [record, setRecord] = useState(data);
  const [hoveredData, setHoveredData] = useState<LivabilityIndex | null>(null);
  const [year, setYear] = useState(2022);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedYear, setSelectedYear] = useState(2022);
  const [viewType, setViewType] = useState('map');
  const inputElement = document.querySelector('.province') as HTMLInputElement | null;
  const yearElement = document.querySelector('.year') as HTMLInputElement | null;

  const handleMouseMove = (event: any) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  function handleFilter(event: any, year: any) {
    const targeted = event.toLowerCase();
    const newData = data.filter(row => {
      const provinceMatch = row.province.toLowerCase().includes(targeted);
      const yearMatch = row.year.toString().toLowerCase().includes(year);
      return provinceMatch && yearMatch;
    });
    setRecord(newData);
  }

  function handleMouseEnterMap(e: any, geo: any) {
    setHoveredData(() => {
      return data.filter(row => {
        const provinceMatch = row.province.toLowerCase().includes(geo.properties.provinsi.toLowerCase());
        const yearMatch = row.year.toString().toLowerCase().includes(year.toString());
        return provinceMatch && yearMatch;
      })[0];
    });
    handleMouseMove(e);
  }

  function handleMouseClickMap(geo: any) {
    if (inputElement?.value != null && inputElement?.value !== "") {
      inputElement.value = "";
      yearElement!.value = "";
    } else if (inputElement != null && yearElement != null) {
      inputElement.value = geo.properties.provinsi;
      yearElement.value = year.toString();
    }
    handleFilter(inputElement?.value, yearElement?.value);
  }

  function handleMapYear(selectedYear: number) {
    setYear(selectedYear);
    setSelectedYear(selectedYear);
    handleFilter(inputElement?.value, selectedYear);
  }

  async function fetchData() {
    const csv_data = await read_csv('./livability_index.csv') as LivabilityIndex[];
    const response = await predict(csv_data);
    setData(response);
    setRecord(response);
  }

  const customStyles = {
    header: {
      style: {
        fontSize: '20px',
      },
    },
    rows: {
      style: {
        minHeight: '60px',
      },
    },
    headCells: {
      style: {
        fontSize: '1rem',
        paddingLeft: '8px',
        paddingRight: '8px',
        backgroundColor: '#CE1126',
        borderBottomColor: '#ffffff',
        color: 'white',
      },
    },
    cells: {
      style: {
        fontSize: '1rem',
        paddingLeft: '8px',
        paddingRight: '8px',
        borderBottomColor: '#CE1126',
      },
    },
  };

  const colorMapping = (currRow: LivabilityIndex | { livability_index: string; }) => {
    return {
      default: {
        fill: (() => {
          if (currRow.livability_index === "High") {
            return "green";
          } else if (currRow.livability_index === "Medium") {
            return "orange";
          } else if (currRow.livability_index === "Low") {
            return "red";
          } else {
            return "#D6D6DA";
          }
        })(),
        outline: "none",
      },
      hover: {
        fill: (() => {
          if (currRow.livability_index === "High") {
            return "rgba(0, 100, 0, 0.8)";
          } else if (currRow.livability_index === "Medium") {
            return "rgba(255, 140, 0, 0.6)";
          } else if (currRow.livability_index === "Low") {
            return "rgba(139, 0, 0, 0.8)";
          } else {
            return "rgba(211, 211, 211, 0.8)";
          }
        })(),
        outline: "none",
      },
      pressed: {
        fill: "red",
        outline: "none",
      },
    };
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className='app'>
      <h1 className='titleFont'>Livability Index Indonesia {year}</h1>
      <div className='choiceButton'>
        <button
          className={`choices ${viewType === 'map' ? 'selectedView' : ''}`}
          onClick={() => setViewType('map')}
          style={{ backgroundColor: viewType === 'map' ? '#D32F2F' : 'white' }}
        >
          Map View
        </button>
        <button
          className={`choices ${viewType === 'chart' ? 'selectedView' : ''}`}
          onClick={() => setViewType('chart')}
          style={{ backgroundColor: viewType === 'chart' ? '#D32F2F' : 'white' }}
        >
          Chart View
        </button>
      </div>
      <div className='mapContainer'>
        {viewType === 'map' ? (
          <>
            <ComposableMap
              style={{ width: "100%", height: "750px" }}
              projection="geoMercator"
              projectionConfig={{
                center: [118, -5],
                scale: 1500,
              }}
            >
              <Geographies geography={indonesiaTopoJson}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const currRow = record.find(row => row.province.toLowerCase().includes(geo.properties.provinsi.toLowerCase()) && row.year === year) || { livability_index: "" };
                    return (
                      <Geography
                        onMouseEnter={(e) => handleMouseEnterMap(e, geo)}
                        onClick={() => handleMouseClickMap(geo)}
                        onMouseLeave={() => {
                          setHoveredData(null);
                        }}
                        key={geo.rsmKey}
                        geography={geo}
                        style={colorMapping(currRow)}
                      />
                    );
                  })
                }
              </Geographies>
            </ComposableMap>
          </>
        ) : (
          <LivabilityBarchart data={data.filter(row => row.year === year)} />
        )}

        <div className='dataContainer'>
          <button
            className={`yearButton buttonTop ${selectedYear === 2020 ? 'selectedYear' : ''}`}
            onClick={() => handleMapYear(2020)}
          >
            2020
          </button>
          <button
            className={`yearButton buttonTop ${selectedYear === 2021 ? 'selectedYear' : ''}`}
            onClick={() => handleMapYear(2021)}
          >
            2021
          </button>
          <button
            className={`yearButton buttonTop ${selectedYear === 2022 ? 'selectedYear' : ''}`}
            onClick={() => handleMapYear(2022)}
          >
            2022
          </button>
        </div>

        <Hovered hoveredGeography={hoveredData} location={mousePosition} />
      </div>

      <div className='dataContainer'>
        <div className='inputation'>
          <p>Provinsi</p>
          <input
            className='inputProvince province'
            type="text"
            onChange={() => handleFilter(inputElement?.value, yearElement?.value)}
          />
        </div>
        <div className='inputation'>
          <p>Year</p>
          <select
            className='inputYear year'
            onChange={() => handleFilter(inputElement?.value, yearElement?.value)}
          >
            <option value=""></option>
            <option value="2020">2020</option>
            <option value="2021">2021</option>
            <option value="2022">2022</option>
          </select>
        </div>
      </div>

      <div className='tableContainer'>
        <DataTable
          columns={columns}
          data={record}
          customStyles={customStyles}
        />
      </div>
    </div>
  );
}
