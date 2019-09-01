import { Component, OnInit, Inject } from '@angular/core';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { Promotion } from '../shared/promotion';
import { PromotionService } from '../services/promotion.service';
import { Leader } from '../shared/leader';
import { LeaderService } from '../services/leader.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  dish: Dish;
  dishErrMsg: string;

  promotion: Promotion;
  promotionErrMsg: string;

  leader: Leader;
  leaderErrMsg: string;

  constructor(private dishservice: DishService,
    private promotionservice: PromotionService,
    private leaderService: LeaderService,
    @Inject('BaseURL') private BaseURL) { }

  ngOnInit() {
    this.dishservice.getFeaturedDish().subscribe(dish => this.dish = dish,
      errMsg => this.dishErrMsg = <any>errMsg);
    this.promotionservice.getFeaturedPromotion().subscribe(promotion => this.promotion = promotion,
      errMsg => this.promotionErrMsg = <any>errMsg);
    this.leaderService.getFeaturedLeader().subscribe(leader => this.leader = leader,
      errMsg => this.leaderErrMsg = <any>errMsg);
  }

}
