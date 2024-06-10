import './App.css';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import indonesiaTopoJson from './assets/provinces-simplified-topo.json';
import { useEffect, useState } from 'react';
import Hovered from './elements/hoveredInfo';
import DataTable from 'react-data-table-component';
import { read_csv } from './utils/csv_utils';
import { predict } from './controller/kmedoids_controller';
import { LivabilityIndex } from './model/livabilityIndex';

export default function App() {
  const [data, setData] = useState<LivabilityIndex[]>([]);
  const [hoveredGeography, setHoveredGeography] = useState('')
  const [hoveredData, sethoveredData] = useState<LivabilityIndex|null>(null);
  const [year, setYear] = useState(2022)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
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
  console.log(rowA)
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
      sortFunction : caseInsensitiveSort
    }
  ]

  const [record, setRecord] = useState(data)

  function handleFilter(event: React.ChangeEvent<HTMLInputElement>, whichFilter: string) {
  function handleFilter(event : any, year : any) {
    const targeted = event.toLowerCase()
    const newData = data.filter(row => {
      if (whichFilter === "province") {
        return row.province.toLowerCase().includes(event.target.value.toLowerCase())
      } else if (whichFilter === "year") {
        return row.year.toString().includes(event.target.value.toLowerCase())
      }
      return true
      const provinceMatch = row.province.toLowerCase().includes(targeted);
      const yearMatch = row.year.toString().toLowerCase().includes(year);
      return provinceMatch && yearMatch;
    })
    setRecord(newData)
  }

  const customStyles = {
    header: {
      style: {
        fontSize: '100px',
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
      },
    },
    cells: {
      style: {
        fontSize: '1rem',
        paddingLeft: '8px',
        paddingRight: '8px',
      },
    },
  }

  async function fetchData() {
    const csv_data = await read_csv('./livability_index.csv') as LivabilityIndex[];
    const response = await predict(csv_data);
    setData(response);
    setRecord(response);
    console.log(response)
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className='app'>
      <h1>Indonesia Map</h1>
      <div className='dataContainer'>
          <button onClick={() => setYear(2020)}>2020</button>
          <button onClick={() => setYear(2021)}>2021</button>
          <button onClick={() => setYear(2022)}>2022</button>
        </div>
        <ComposableMap style={{ width: "100%", height: "900px" }}
          projection="geoMercator"
        projection="geoMercator"
          projectionConfig={{
            center: [118, -2],
            scale: 1000
          }}
        >
          <Geographies geography={indonesiaTopoJson}>
            {({ geographies }) =>
            geographies.map((geo) => {
              const currRow = record.find(row => row.province.includes(geo.properties.provinsi)  && row.year === parseInt(year)) ?? {livability_index : ''}
              console.log(currRow.livability_index)
                return <Geography onMouseEnter={(e) => {
                  setHoveredGeography(geo.properties.provinsi)
                  handleMouseMove(e)
                }}
                  onMouseLeave={() => setHoveredGeography('')}
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
                  onMouseLeave={() => {
                    console.log("anjayy")
                    sethoveredData(null)
                  }}
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => {
                    if (inputElement != null && yearElement != null) {
                      inputElement.value = geo.properties.provinsi;
                      yearElement.value = year.toString();
                    }
                    handleFilter(inputElement?.value , yearElement?.value)
                  }}
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
                      fill: "#F53",
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
        <Hovered hoveredGeography={hoveredGeography} location={mousePosition} />
        <Hovered hoveredGeography={hoveredData} location={mousePosition} />

        <div className='dataContainer'>
          <p>Provinsi: </p>
          <input className='input' type="text" onChange={e => handleFilter(e, "province")} />
          <input className='input province' type="text"  onChange={e => handleFilter(inputElement?.value , yearElement?.value)} />
          <p>Year: </p>
          <input className='input' type="text" onChange={e => handleFilter(e, "year")} />
          <input className='input year' type="text" onChange={e => handleFilter(inputElement?.value , yearElement?.value)} />
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

