import './App.css';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import indonesiaTopoJson from './assets/provinces-simplified-topo.json';
import { useEffect, useState } from 'react';
import Hovered from './elements/hoveredInfo';
import DataTable from 'react-data-table-component';
import { read_csv } from './utils/csv_utils';
import { predict } from './controller/kmedoids_controller';
import { LivabilityIndex } from './model/livabilityIndex';
import LivabilityBarchart from './elements/barChart';

export default function App() {
  const [data, setData] = useState<LivabilityIndex[]>([]);
  const [hoveredData, sethoveredData] = useState<LivabilityIndex | null>(null);
  const [year, setYear] = useState(2022)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedYear, setSelectedYear] = useState(2022);
  const [viewType, setViewType] = useState('map')
  const inputElement = document.querySelector('.province') as HTMLInputElement | null;
  const yearElement = document.querySelector('.year') as HTMLInputElement | null;

  const handleMouseMove = (event: any) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const sortValue = [
    { name: 'low', value: 1 },
    { name: 'medium', value: 2 },
    { name: 'high', value: 3 }
  ];

  const caseInsensitiveSort = ( rowA : any, rowB : any ) => {
  const a = rowA.livability_index.toLowerCase();
  const b = rowB.livability_index.toLowerCase();

  const valueA = sortValue.find(item => item.name === a)?.value || 0;
  const valueB = sortValue.find(item => item.name === b)?.value || 0;

  if (valueA > valueB) {
    return 1;
  }

  if (valueB > valueA) {
    return -1;
  }

  return 0;
};

  const columns = [
    {
      name: 'Province',
      selector: (row: LivabilityIndex) => row.province
    },
    {
      name: 'Year',
      selector: (row: LivabilityIndex) => row.year
    },
    {
      name: 'Health Index',
      selector: (row: LivabilityIndex) => row.health_index,
    },
    {
      name: 'Polution',
      selector: (row: LivabilityIndex) => row.polution,
    },
    {
      name: 'Crime Rate',
      selector: (row: LivabilityIndex) => row.crime_rate,
    },
    {
      name: 'Purchasing Power',
      selector: (row: LivabilityIndex) => row.purchasing_power,
    },
    {
      name: 'Living Cost Stddev',
      selector: (row: LivabilityIndex) => row.living_cost,
      cell: (row: any) => row.living_cost.toFixed(2) 
    },
    {
      name: 'Livability Index',
      selector: (row: LivabilityIndex) => row.livability_index,
      sortable: true,
      sortFunction: caseInsensitiveSort,
      conditionalCellStyles: [
        {
          when: (row: LivabilityIndex) => row.livability_index.toLowerCase() === 'low',
          style: {
            backgroundColor: 'rgba(255, 0, 0, 0.5)',
            color: 'black',
          },
        },
        {
          when: (row: LivabilityIndex) => row.livability_index.toLowerCase() === 'medium',
          style: {
            backgroundColor: 'rgba(255, 165, 0, 0.5)',
            color: 'black',
          },
        },
        {
          when: (row: LivabilityIndex) => row.livability_index.toLowerCase() === 'high',
          style: {
            backgroundColor: 'rgba(0, 128, 0, 0.5)',
            color: 'black',
          },
        },
      ],
    }
  ]

  const [record, setRecord] = useState(data)

  function handleFilter(event: any, year: any) {
    const targeted = event.toLowerCase()
    const newData = data.filter(row => {
      const provinceMatch = row.province.toLowerCase().includes(targeted);
      const yearMatch = row.year.toString().toLowerCase().includes(year);
      return provinceMatch && yearMatch;
    })
    setRecord(newData)
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
  }

  async function fetchData() {
    const csv_data = await read_csv('./livability_index.csv') as LivabilityIndex[];
    const response = await predict(csv_data);
    setData(response);
    setRecord(response);
  }

  const handleMapYear = (selectedYear: number) => {
    setYear(selectedYear);
    setSelectedYear(selectedYear);
  };

  function handleTableYear(e: any) {
    handleFilter(e, "year");
}

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className='app'>
      <h1 className='titleFont'>Livability Index Indonesia {year}</h1>
      <div className='choiceButton'>
        <button className='choices' onClick={()=>setViewType('map')}>Map View</button>
        <button className='choices' onClick={()=>setViewType('chart')}>Chart View</button>
      </div>
      <div className='mapContainer'>
        {viewType === 'map' ? <>
          <ComposableMap style={{ width: "100%", height: "750px" }}
          projection="geoMercator"
          projectionConfig={{
            center: [118, -5],
            scale: 1500
            }}
            >
          <Geographies geography={indonesiaTopoJson}>
            {({ geographies }) =>
            geographies.map((geo) => {
              const currRow = record.find(row => row.province.includes(geo.properties.provinsi)  && row.year === year) ?? {livability_index : ''}
              return <Geography onMouseEnter={(e) => {
                sethoveredData(() => {
                  return data.filter(row => {
                    const provinceMatch = row.province.toLowerCase().includes(geo.properties.provinsi.toLowerCase());
                    const yearMatch = row.year.toString().toLowerCase().includes(year.toString())
                    return provinceMatch && yearMatch;
                  })[0]
                })
                handleMouseMove(e)
              }}
                onClick={() => {
                  if(inputElement?.value != null && inputElement?.value != ""){
                    inputElement.value = "";
                    handleFilter(inputElement?.value, yearElement?.value)
                    return
                  }
                  
                  if (inputElement != null && yearElement != null) {
                    inputElement.value = geo.properties.provinsi;
                    yearElement.value = year.toString();
                  }
                  handleFilter(inputElement?.value, yearElement?.value)
              }}
                onMouseLeave={() => {
                  sethoveredData(null)}}
                key={geo.rsmKey}
                geography={geo}
                style={{
                  default: {
                    fill: (() => {
                      if (currRow.livability_index == "High") {
                          return "green";
                        } else if (currRow.livability_index == "Medium") {
                          return "orange";
                          }else if (currRow.livability_index == "Low") {
                            return "Red";
                            }
                            })(),
                            outline: "none",
                            
                            },
                            hover: {
                              fill: (() => {
                                if (currRow.livability_index === "High") {
                                  return "rgba(0, 100, 0, 0.8)"
                                } else if (currRow.livability_index === "Medium") {
                                  return "rgba(255, 140, 0, 0.6)"; 
                                } else if (currRow.livability_index === "Low") {
                                  return "rgba(139, 0, 0, 0.8)";
                                }
                            })(),
                            outline: "none"
                            },
                            pressed: {
                      fill: "#E42",
                      outline: "none"
                    }
                  }}
                />
                })
            }
          </Geographies>
        </ComposableMap>
        </> :
        <LivabilityBarchart data={data.filter(row => row.year === year)} />
        }
        
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
          <input className='inputProvince province' type="text" onChange={e => handleFilter(inputElement?.value, yearElement?.value)} />
        </div>
        <div className='inputation'>
          <p>Year</p> 
          <select className='inputYear year'onChange={e => handleFilter(inputElement?.value, yearElement?.value)}>
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

