import queryClient from '../../QueryClient'

export type QueryKey = string[] | string




//FIXME: czy tutaj jest błąd? POnowne wyszukiwanie szuka nie w całej tablicy ale w tablicy z ostatniego szukania. WHY???
export const genericSearch = <T>(queryKey: QueryKey) => (
  column: keyof T,
  search: string,
) => {
  console.log('Szukaj=>',search, column)
  if (!search){
    return  queryClient.refetchQueries([queryKey], { stale: true })
  }
  // queryClient.refetchQueries([queryKey], { stale: true }).then(data=>console.log(data))

  queryClient.setQueryData(queryKey, (items) => {
    if (!items) return items;
    console.log('org', items);
    console.log('ret', (items as T[]).filter((item) => `${item[column]}`.match(search)))
    return (items as T[]).filter((item) => `${item[column]}`.match(search));
  })
}















export const genericSort = <T>(queryKey: QueryKey) => (column: keyof T) => {
  queryClient.setQueryData(queryKey, (items) => {
    if (!items || !(items as T[]).length) return items

    const itemsArr = [...(items as T[])]
    if (typeof itemsArr[0][column] === 'number')
      // @ts-ignore
      return itemsArr.sort((a, b) => a[column] - b[column])

    return itemsArr.sort((a, b) => `${a[column]}`.localeCompare(`${b[column]}`))
  })
}
