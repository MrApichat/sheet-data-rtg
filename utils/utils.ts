export function compare(a: any, b: any) {
    if (a.population < b.population) {
      return 1;
    }
    if (a.population > b.population
    ) {
      return -1;
    }
    return 0;
  }