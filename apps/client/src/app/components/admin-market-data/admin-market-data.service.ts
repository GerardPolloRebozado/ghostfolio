import { AdminService } from '@ghostfolio/client/services/admin.service';
import { ghostfolioScraperApiSymbolPrefix } from '@ghostfolio/common/config';
import { getCurrencyFromSymbol, isCurrency } from '@ghostfolio/common/helper';
import {
  AdminMarketDataItem,
  UniqueAsset
} from '@ghostfolio/common/interfaces';

import { Injectable } from '@angular/core';
import { EMPTY, catchError, finalize, forkJoin, takeUntil } from 'rxjs';

@Injectable()
export class AdminMarketDataService {
  public constructor(private adminService: AdminService) {}

  public deleteAssetProfile({ dataSource, symbol }: UniqueAsset) {
    const confirmation = confirm(
      $localize`Do you really want to delete this asset profile?`
    );

    if (confirmation) {
      this.adminService
        .deleteProfileData({ dataSource, symbol })
        .subscribe(() => {
          setTimeout(() => {
            window.location.reload();
          }, 300);
        });
    }
  }

  public deleteAssetProfiles(uniqueAssets: UniqueAsset[]) {
    const confirmation = confirm(
      $localize`Do you really want to delete these profiles?`
    );

    if (confirmation) {
      const deleteRequests = uniqueAssets.map(({ dataSource, symbol }) => {
        return this.adminService.deleteProfileData({ dataSource, symbol });
      });

      forkJoin(deleteRequests)
        .pipe(
          catchError(() => {
            alert($localize`Oops! Could not delete profiles.`);

            return EMPTY;
          }),
          finalize(() => {
            setTimeout(() => {
              window.location.reload();
            }, 300);
          })
        )
        .subscribe(() => {});
    }
  }

  public hasPermissionToDeleteAssetProfile({
    activitiesCount,
    isBenchmark,
    symbol
  }: Pick<AdminMarketDataItem, 'activitiesCount' | 'isBenchmark' | 'symbol'>) {
    return (
      activitiesCount === 0 &&
      !isBenchmark &&
      !isCurrency(getCurrencyFromSymbol(symbol)) &&
      !symbol.startsWith(ghostfolioScraperApiSymbolPrefix)
    );
  }
}
