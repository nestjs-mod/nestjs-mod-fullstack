import { Pipe, PipeTransform } from '@angular/core';
import { NzTableSortOrder } from 'ng-zorro-antd/table';

@Pipe({
  standalone: true,
  name: 'nzTableSortOrderDetector',
})
export class NzTableSortOrderDetectorPipe implements PipeTransform {
  transform(value: string): NzTableSortOrder {
    if (value === 'asc') {
      return 'ascend';
    }
    if (value === 'desc') {
      return 'descend';
    }
    return null;
  }
}
