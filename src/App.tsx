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
import React, { useEffect, useState } from "react";
import axios from "axios";

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
  const [searchValue, setSearchValue] = useState("");

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
    setSearchValue(value);
  };

  useEffect(() => {
    fetchData().then((peopleList) => {
      setFlatLocations(
        flattenLocations(peopleList.map(({ location }) => location))
      );
    });
  }, []);

  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
      <label>Search</label>
      <input
        placeholder="search something"
        value={searchValue}
        onChange={(e) => {
          onSearchValueChange(e.target.value);
        }}
      />
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
          {getFilteredRows(flatLocations, searchValue).map(
            (location, locationIdx) => {
              return (
                <tr key={locationIdx}>
                  {Object.keys(location).map((header, headerIdx) => (
                    <td key={headerIdx}>{location[header]}</td>
                  ))}
                </tr>
              );
            }
          )}
        </tbody>
      </table>
    </div>
  );
}
