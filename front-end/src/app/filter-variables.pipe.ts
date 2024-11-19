import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterVariables',
})
export class FilterVariablesPipe implements PipeTransform {
  transform(items: any[], excludeList: string[]): any[] {
    if (!items || !excludeList) {
      return items;
    }
    // Filtrar los items para el menú
    return items.filter(item => !excludeList.includes(item.nombreCorto));
  }
}
