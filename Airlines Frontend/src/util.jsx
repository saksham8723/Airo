export default function manualSortFlights(flightData, ascending = true) {
  const arr = [...flightData];
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      let swap = false;

      // Compare price first
      if (arr[j].price !== arr[j + 1].price) {
        swap = ascending ? arr[j].price > arr[j + 1].price : arr[j].price < arr[j + 1].price;
      }
      // If price same, compare seats
      else {
        swap = ascending ? arr[j].seats > arr[j + 1].seats : arr[j].seats < arr[j + 1].seats;
      }

      if (swap) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}