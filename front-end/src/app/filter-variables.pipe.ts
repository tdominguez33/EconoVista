import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterVariables',
})
export class FilterVariablesPipe implements PipeTransform {
  transform(items: any[], excludeList: string[]): any[] {
    if (!items || !excludeList) {
      return items;
    }
    // Filtrar los items que no están en la lista de exclusión
    return items.filter(item => !excludeList.includes(item.nombreCorto));
  }
}
