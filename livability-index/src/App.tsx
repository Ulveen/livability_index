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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event: any) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
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
    },
    {
      name: 'Livability Index',
      selector: (row: LivabilityIndex) => row.livability_index,
      sortable: true
    }
  ]

  const [record, setRecord] = useState(data)

  function handleFilter(event: React.ChangeEvent<HTMLInputElement>, whichFilter: string) {
    const newData = data.filter(row => {
      if (whichFilter === "province") {
        return row.province.toLowerCase().includes(event.target.value.toLowerCase())
      } else if (whichFilter === "year") {
        return row.year.toString().includes(event.target.value.toLowerCase())
      }
      return true
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
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className='app'>
      <h1>Indonesia Map</h1>
        <ComposableMap style={{ width: "100%", height: "900px" }}
          projection="geoMercator"
          projectionConfig={{
            center: [118, -2],
            scale: 1000
          }}
        >
          <Geographies geography={indonesiaTopoJson}>
            {({ geographies }) =>
              geographies.map((geo) => {
                return <Geography onMouseEnter={(e) => {
                  setHoveredGeography(geo.properties.provinsi)
                  handleMouseMove(e)
                }}
                  onMouseLeave={() => setHoveredGeography('')}
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: {
                      fill: "#D6D6DA",
                      outline: "none"
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

        <div className='dataContainer'>
          <p>Provinsi: </p>
          <input className='input' type="text" onChange={e => handleFilter(e, "province")} />
          <p>Year: </p>
          <input className='input' type="text" onChange={e => handleFilter(e, "year")} />
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

