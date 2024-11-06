import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DailyWorkService } from '../../services/daily-work.service';
import { ResponseDto } from '../../interfaces/customer';
import { HttpClientModule } from '@angular/common/http';

interface WorkEntry {
  id: number;
  name: string;
  employeeId:number;
  workDate: Date;
  workDetail: string;
  workAmount: number;
}

interface Employee {
  id: string;
  employeeName: string;
}

@Component({
  selector: 'app-daily-work',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  providers:[DailyWorkService],
  templateUrl: './daily-work.component.html',
  styleUrl: './daily-work.component.css'
})
export class DailyWorkComponent implements OnInit {
  selectedEmployee: number = 0;
  workEntries: WorkEntry[] = [];
  showDialog = false;
  employees: Employee[] = [
    { id: '1', employeeName: 'John Doe' },
    { id: '2', employeeName: 'Jane Smith' },
    { id: '3', employeeName: 'abc' }
  ];
  Withdraw:boolean = false;
  totalWork:number = 0;
  constructor(private dailyWorkService:DailyWorkService){}
  newWork = {
    employeeId: 0,
    workDetail: '',
    workAmount: 0
  };
  getDailyWorkOfEmployee(id:number){
    this.dailyWorkService.getDailyWorks(id).subscribe({
      next:(response:ResponseDto)=>{
        this.workEntries = response.responseObject;
        this.totalWork = this.workEntries.reduce((sum, entry) => sum + entry.workAmount, 0);
      }
    });
  }
  ngOnInit() {
    // Sample data - replace with actual data source
    this.dailyWorkService.getEmployee().subscribe({
      next:(response:ResponseDto)=>{
        this.employees = response.responseObject;
      }
    })
  }

  getGroupedWork() {
    const filtered = this.workEntries;
    return this.groupByWeek(filtered);
  }

  isDebit(amount: number): boolean {
    return amount < 0; // Returns true if the amount is negative
  }

  isCredit(amount: number): boolean {
    return amount > 0; // Returns true if the amount is positive
  }

  private groupByWeek(entries: WorkEntry[]) {
    const groups = new Map<string, WorkEntry[]>();
    
    entries.forEach(entry => {
      const weekStart = this.getWeekStart(entry.workDate);
      const key = weekStart.toISOString();
      
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)?.push(entry);
    });

    return Array.from(groups.entries())
      .map(([key, work]) => ({
        weekStart: new Date(key),
        // Ensure workDate is a Date object before sorting
        work: work.sort((a, b) => new Date(b.workDate).getTime() - new Date(a.workDate).getTime())
      }))
      .sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime());
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    return d;
  }

  openDialog() {
    this.showDialog = true;
  }

  closeDialog() {
    this.showDialog = false;
    this.newWork = { employeeId: 0, workDetail: '', workAmount: 0 };
  }

  submitWork() {
    if (this.newWork.employeeId) {
      if(this.Withdraw){
        this.newWork.workAmount = this.newWork.workAmount - 2*this.newWork.workAmount;
      }
      this.dailyWorkService.addDailyWork(this.newWork).subscribe({
        next:(respone:ResponseDto)=>{
          if(respone.isSuccess){
            alert(respone.message);
            this.getDailyWorkOfEmployee(this.selectedEmployee);
            this.closeDialog();
          }else{
            alert(respone.message);
          }
        }
      });
      this.closeDialog();
    }
  }
}
