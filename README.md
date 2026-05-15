run project
backend
  cd backend
  go run . หรือ go run main.go
  
frontend 
  cd frontend
  cd logis
  npm run dev หรือ pnpm dev

สามารถใช้ feature rate limit login (1 min ban) ได้จากคำสั่ง
docker run -d -p 6379:6379 redis:7-alpine (ไม่ใส่ก็สามารถรันได้)

user login 
     driver:     username: d1
                 password: 123
     driver2:    username:d2
                 password:123
     superviser: username: s1
                 password: 123
     finance:    username: f1
                 password: 123

สิ่งที่ทำไป - frontend ที่เกิด bug,
          การจัดการ secret key ผ่าน env,
          redis จัดการ rate limit,
          docker base สำหรับ run in 1 command (in progress),
          RBAC ครบทุก handler

workflow

user:d1 login -> create trip -> ส่ง fuel claim

user:s1 login -> ตรวจสอบ fuel claim -> approve/reject

user:s1 login -> ตรวจสอบ fuel claim -> approve/reject ครั้งที่2

risk ที่อาจจะเจอ
การยิง request เป็นจำนวนมากที่อาจเกิดปัญหา
          
        
