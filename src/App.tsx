/**
 * Implementing this application is for learning purposes.
 * React material covered in this app:
 * Fetching data using axios, and render that data in a table.
 * utilizing Effect and State hooks.
 * using models and enums, to handle typings in TypeScript
 * Flatten a data object from API.
 * destructuring objects and arrays.
 * filter and sort data on a table.
 * event handling. OnClick and OnChange`
 *
 */
import "./styles.css";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Child from "./Child";

type Location = any;
enum SortingDirection {
  ASCENDING = "ASCENDING",
  DESCENDING = "DESCENDING",
  UNSORTED = "UNSORTED"
}
interface SortingData {
  key: string;
  direction: SortingDirection;
}

const fetchData = () => {
  return axios
    .get(`https://randomuser.me/api/?results=20`)
    .then((result) => {
      const { results } = result.data;
      return results;
    })
    .catch((error) => {
      console.error(error);
    });
};

const flattenLocations = (locations: Location[]) => {
  let flatLocations = [];

  for (const { street, coordinates, timezone, ...rest } of locations) {
    flatLocations.push({
      ...rest,
      number: street.number,
      name: street.name,
      longitude: coordinates.longitude,
      latitude: coordinates.latitude,
      timezone: timezone.description
    });
  }
  return flatLocations;
};

const getFilteredRows = (rows: Location[], searchKey: string) => {
  if (!searchKey || searchKey.length < 3) return rows;

  console.log(`filtered rows. current length is ... ${rows.length}`);

  return rows.filter((row: any) =>
    Object.values(row).some((s) => String(s).toLowerCase().includes(searchKey))
  );
};

export default function App() {
  const [flatLocations, setFlatLocations] = useState([]);
  const [sortingDirection, setSortingDirection] = useState({
    key: "",
    direction: SortingDirection.UNSORTED
  });
  const [childData, setChildData] = useState(0);
  const [childToParentData, setChildToParentData] = useState("");
  /**
   * Storing userInput and filtered rows as a state and userInput.
   * Previously: Saved the userInput in a State hook, and re-rendering filteredRows on every character input. T
   * While it is a cool user interation, this is an expensive feature especially as the # of locations increase.
   *
   * Now: No re-render on search interactions. One useRef hook, and saving filtered rows in a separate state.
   *
   */
  const userInput = useRef("");
  const [filteredRows, setFilteredRows] = useState([]);

  const parentToChild = () => {
    setChildData(childData + 1);
  };

  const childToParent = (message) => {
    setChildToParentData(message);
  };

  const sortColumn = (sortByKey: string) => {
    // flatLocations is a list of location objects.
    // we want to return this list, but sorted on sortByKey
    const sortedLocations = [...flatLocations];
    let newSortingDirection = SortingDirection.UNSORTED;

    sortedLocations.sort((a: any, b: any) => {
      const aValue = a[sortByKey];
      const bValue = b[sortByKey];

      if (
        sortingDirection.direction === SortingDirection.UNSORTED ||
        sortingDirection.direction === SortingDirection.ASCENDING
      ) {
        newSortingDirection = SortingDirection.DESCENDING;

        if (aValue < bValue) return -1;
        if (aValue > bValue) return 1;
        return 0;
      } else {
        newSortingDirection = SortingDirection.ASCENDING;

        if (aValue > bValue) return -1;
        if (aValue < bValue) return 1;
        return 0;
      }
    });

    setSortingDirection({ key: sortByKey, direction: newSortingDirection });
    setFlatLocations(sortedLocations);
  };

  const onSearchValueChange = (value: string) => {
    userInput.current = value;
  };

  const onClickSearch = () => {
    if (!userInput.current) {
      setFilteredRows(getFilteredRows(flatLocations, "") as never[]);
    }
    setFilteredRows(
      getFilteredRows(flatLocations, userInput.current) as never[]
    );
  };

  useEffect(() => {
    fetchData().then((peopleList) => {
      console.log("re-rendering");
      setFlatLocations(
        flattenLocations(peopleList.map(({ location }) => location))
      );
      setFilteredRows(flatLocations);
    });
  }, []);

  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
      <div>
        <p>
          This is the message from the child:{" "}
          {childToParentData || "...no message yet..."}
        </p>
        <Child parentToChild={childData} childToParent={childToParent} />
      </div>
      <div>
        <button onClick={() => parentToChild()}>Click parent</button>
        <button onClick={() => onClickSearch()}>Search</button>
      </div>
      <div>
        <label>Search</label>
        <input
          placeholder="search something"
          onChange={(e) => {
            onSearchValueChange(e.target.value);
          }}
        />
      </div>
      <table>
        <thead>
          <tr>
            {flatLocations &&
              flatLocations.length &&
              Object.keys(flatLocations[0]).map((header: string, headerIdx) => (
                <th
                  key={headerIdx}
                  onClick={() => {
                    sortColumn(header);
                  }}
                >
                  {header}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {filteredRows.map((location, locationIdx) => {
            return (
              <tr key={locationIdx}>
                {Object.keys(location).map((header, headerIdx) => (
                  <td key={headerIdx}>{location[header]}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
