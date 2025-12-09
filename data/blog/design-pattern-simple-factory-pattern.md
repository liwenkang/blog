---
title: Design Pattern - Simple Factory Pattern
date: '2024-10-13'
tags:
  - DESIGN PATTERN
  - SIMPLE FACTORY PATTERN
draft: false
summary: >-
  The design pattern is a general, reusable solution to a commonly occurring
  problem within a given context in software design. I have learned some design
  patterns in the past, but I don't think I have ...
---

The design pattern is a general, reusable solution to a commonly occurring problem within a given context in software design.

I have learned some design patterns in the past, but I don't think I have a good understanding of them. So I want to write down what I have learned and my thoughts on them.

In most cases, I will use React and TypeScript in my projects, so the examples and explanations will be related to these two technologies.

Here is an easy example of recommended product system. you can input the category of the product, and the system will recommend the products.

```ts
class ProductRecommender {
  recommend(category: string) {
    if (category === 'phone') {
      return ['iPhone', 'Samsung Galaxy', 'Google Pixel']
    } else if (category === 'tablet') {
      return ['iPad', 'Samsung Galaxy Tab', 'Google Pixel Slate']
    } else if (category === 'laptop') {
      return ['MacBook', 'Dell XPS', 'HP Spectre']
    } else {
      throw new Error('Invalid category')
    }
  }
}

const recommender = new ProductRecommender()
console.log(recommender.recommend('phone'))
```

now, it contains three types of products: phone, tablet, and laptop. And all logic is in the `ProductRecommender` class. But if we want to add more products in the future, we need to modify the `ProductRecommender` class. and it violates the Open/Closed Principle.

So we can make some changes to the code.

```ts
class ProductRecommender {
  recommendPhone() {
    return ['iPhone', 'Samsung Galaxy', 'Google Pixel']
  }

  recommendTablet() {
    return ['iPad', 'Samsung Galaxy Tab', 'Google Pixel Slate']
  }

  recommendLaptop() {
    return ['MacBook', 'Dell XPS', 'HP Spectre']
  }

  recommend(category: string) {
    let result: string[] = []
    if (category === 'phone') {
      result = this.recommendPhone()
    } else if (category === 'tablet') {
      result = this.recommendTablet()
    } else if (category === 'laptop') {
      result = this.recommendLaptop()
    } else {
      throw new Error('Invalid category')
    }
    return result
  }
}

const recommender = new ProductRecommender()
console.log(recommender.recommend('phone'))
```

All logic is also in the `ProductRecommender` class. But it defines three methods to recommend products. Now, the `ProductRecommender` class is more flexible and easier to maintain.

If we want to add more products in the future, we can just add more methods like `recommendPhone`, `recommendTablet`, and `recommendLaptop`. But it violates the Open/Closed Principle. And the `ProductRecommender` class is still too long. Single Responsibility Principle is also violated.

So we can seperate the responsibilities of the `ProductRecommender` class.

```ts
class PhoneRecommender {
  recommend() {
    return ['iPhone', 'Samsung Galaxy', 'Google Pixel']
  }
}

class TabletRecommender {
  recommend() {
    return ['iPad', 'Samsung Galaxy Tab', 'Google Pixel Slate']
  }
}

class LaptopRecommender {
  recommend() {
    return ['MacBook', 'Dell XPS', 'HP Spectre']
  }
}

class ProductRecommender {
  phoneRecommender = new PhoneRecommender()
  tabletRecommender = new TabletRecommender()
  laptopRecommender = new LaptopRecommender()

  recommend(category) {
    let result = []
    if (category === 'phone') {
      result = this.phoneRecommender.recommend()
    } else if (category === 'tablet') {
      result = this.tabletRecommender.recommend()
    } else if (category === 'laptop') {
      result = this.laptopRecommender.recommend()
    } else {
      throw new Error('Invalid category')
    }
    return result
  }
}

const recommender = new ProductRecommender()
console.log(recommender.recommend('phone'))
```

Now, the different types of products are separated into different classes. If we want to add more products in the future, we can just add more classes like `PhoneRecommender`, `TabletRecommender`, and `LaptopRecommender`. And the `ProductRecommender` class is more concise and easier to understand. But it violates the Single Responsibility Principle.

Let's try to use the factory pattern to solve this problem.

```ts
interface Recommender {
  recommend(): string[]
}

class PhoneRecommender implements Recommender {
  recommend() {
    return ['iPhone', 'Samsung Galaxy', 'Google Pixel']
  }
}

class TabletRecommender implements Recommender {
  recommend() {
    return ['iPad', 'Samsung Galaxy Tab', 'Google Pixel Slate']
  }
}

class LaptopRecommender implements Recommender {
  recommend() {
    return ['MacBook', 'Dell XPS', 'HP Spectre']
  }
}

class RecommenderFactory {
  createRecommender(category: string): Recommender {
    if (category === 'phone') {
      return new PhoneRecommender()
    } else if (category === 'tablet') {
      return new TabletRecommender()
    } else if (category === 'laptop') {
      return new LaptopRecommender()
    } else {
      throw new Error('Invalid category')
    }
  }
}

class ProductRecommender {
  recommenderFactory = new RecommenderFactory()

  recommend(category: string) {
    return this.recommenderFactory.createRecommender(category).recommend()
  }
}

const recommender = new ProductRecommender()
console.log(recommender.recommend('phone'))
```

Finally, we add a `RecommenderFactory` class to create the recommender instances. Now, the `ProductRecommender` class is more flexible and easier to maintain. And it follows the Open/Closed Principle and Single Responsibility Principle.
