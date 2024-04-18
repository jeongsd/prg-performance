# Elysia with Bun runtime

# 초기화
```sh
npx prisma migrate dev --name init    
```
# Load Test 실행하기 
```sh
brew install k6
k6 run script.js

# npx artillery run --output test-run-report.json graphql.yaml
# npx artillery report test-run-report.json
```