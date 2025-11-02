import {distinctUntilChanged} from 'rxjs';
import {
  MatCell, MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef, MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable,
  MatTableDataSource
} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {BreakpointObserver} from '@angular/cdk/layout';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {Component, Input, ViewChild} from '@angular/core';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInput} from '@angular/material/input';
import {DatePipe, DecimalPipe, NgClass, NgIf, TitleCasePipe} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatDivider} from '@angular/material/divider';
import {MatPaginator} from '@angular/material/paginator';
import {Balance, Transaction} from '@shared/interfaces';
import {CopyButtonComponent} from '@shared/components';
import {Currency, WalletType} from '@shared/enums';
import {MatIconButton} from '@angular/material/button';
import {PROFILES, TRANSACTIONS, WALLET_TYPE_LABELS} from '@shared/constants';
import {CrudService} from '@shared/services';

@Component({
  selector: 'lib-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({padding: '0', height: '0px', minHeight: '0'})),
      state('expanded', style({padding: 'var(--space-md) var(--space-sm)', height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  standalone: true,
  imports: [
    MatLabel,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    NgIf,
    MatIcon,
    FormsModule,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCell,
    MatCellDef,
    DatePipe,
    DecimalPipe,
    NgClass,
    MatDivider,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    CopyButtonComponent,
    MatPaginator,
    MatIconButton,
    TitleCasePipe
  ]
})
export class TransactionsComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @Input() profileId!: string;
  @Input() tag!: number;

  xSmall = false;
  balances!: Balance[];
  dataSource = new MatTableDataSource<any>();
  columnsToDisplay = ['timestamp', 'type', 'from', 'balance'];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  expandedElement: Transaction | null | undefined;

  constructor(
    private crud: CrudService,
    private breakpoint: BreakpointObserver
  ) {
  }

  ngOnInit(): void {
    this.breakpoint
      .observe(['(max-width: 960px)'])
      .pipe(distinctUntilChanged())
      .subscribe(() => this.breakpointChanged());
    const query = {...TRANSACTIONS};
    query.path = `${PROFILES.path}/${this.profileId}/${TRANSACTIONS.path}`;
    this.crud.getStream(query, true)?.subscribe(data => {
      if (!data) return;
      this.dataSource.data = data;
      this.dataSource.sort = this.sort;
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getParty(tx: Transaction): string {
    if (tx.balance.currency == Currency.USD || tx.balance.currency == Currency.IDR || tx.fromAddress || tx.toAddress) {
      return WalletType.User;
    } else if (tx.from === this.tag) {
      // @ts-ignore
      return (tx.to && tx.to > 1000) ? WalletType.User : WALLET_TYPE_LABELS[tx.to] || '';
    } else if (tx.to === this.tag) {
      if (tx.from)
        return tx.from > 1000 ? WalletType.User :
          tx.from === 1000 ? WalletType.Faucet :
            tx.from < 1000 ? WALLET_TYPE_LABELS[tx.from] : '';
    }
    return `Unknown [${tx.from}-${tx.to}]`;
  }


  getColor(code: number): string {
    switch (code) {
      case 0:
        return "var(--color-warn-light)";
      case 1:
        return "var(--color-primary-light)";
      case 2:
        return "var(--color-accent-light)";
      case 3:
        return "var(--color-warn)";
      case 4:
        return "var(--color-primary)";
    }
    return "var(--color-grey6)"; //"warm";
  }

  private breakpointChanged() {
    if (this.breakpoint.isMatched('(max-width: 960px)')) {
      this.columnsToDisplay = ['timestamp', 'type', 'balance'];
      this.columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
      this.xSmall = true;
    } else {
      this.columnsToDisplay = ['timestamp', 'type', 'from', 'balance'];
      this.columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
      this.xSmall = false;
    }
  }
}
