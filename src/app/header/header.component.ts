import { Component, OnInit } from '@angular/core';
import { DataStorageService } from '../shared/data-sorage.service';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  private usersub: Subscription;
  isAuth = false
  constructor(private dataStorageService: DataStorageService, private authService: AuthService) { }

  ngOnInit() {
    this.usersub = this.authService.user.subscribe(user => {
      this.isAuth = !user ? false : true;
    })
  }

  onSaveData() {
    this.dataStorageService.storeRecipes();

  }
  onFetchData() {
    this.dataStorageService.fetchRecipes()
      .subscribe(recipes => {
        console.log(recipes)
      });
  }
  onLogout() {
    this.authService.logOut();
  }
  ngOnDestroy() {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.usersub.unsubscribe();

  }
}
