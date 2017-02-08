import { Component, OnInit } from '@angular/core';
import { Article } from '../article/article';
import { CanActivate, Router } from '@angular/router';

import { ArticleService } from '../../services/article/article.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  providers: [ ArticleService ],
  styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit {
  articles: Article[] = [];

  constructor(private articleService: ArticleService, private router: Router, private authService: AuthService) {
    // 如果未登录，则跳转至 /welcome 页面
    if (this.authService.getUserInfo() == null)
      this.router.navigate(['/welcome']);

    this.articles = this.articleService.getArticles();
  }

  ngOnInit() {
  }

  read(id: number) {
    let link = ['/article', id];
    this.router.navigate(link);
  }

}
