# Testing Guide - New Features

## Quick Test Scenarios

### 🔧 Test 1: Admin Room Management
**Login:** `admin` / `admin123`

1. Navigate to: System Settings
2. Click "Add Room" in the Manage Rooms section
   - Enter name: "Room 301"
   - Enter capacity: 40
   - Click OK
3. Click "Edit" on the newly created room
   - Change name to "Room 301 - Advanced"
   - Click OK
4. Verify the room name updated
5. Test "Add Lab" with similar steps
6. ✅ Success: Rooms and labs can be created, edited, and deleted

### 👨‍🏫 Test 2: Teacher Room Reservation
**Prerequisites:** 
- Create a teacher account first (register with teacher secret code: AMACC2025)
- Add at least one subject in "Manage Subjects"

**Steps:**
1. Login as teacher
2. Navigate to: Room Reservations
3. Click "Add Reservation"
4. Enter your subject name when prompted
5. Type "lab" or "room" for location type
6. Enter location name (e.g., "Super Lab")
7. Enter today's date in YYYY-MM-DD format (e.g., 2025-12-08)
8. Enter time (e.g., "10:00 - 12:00")
9. ✅ Success: Reservation appears in the list

### 👨‍🎓 Test 3: Student See Class Locations
**Prerequisites:**
- Have a student enrolled in a teacher's subject
- Teacher must have made a reservation for today with that subject

**Steps:**
1. Login as student
2. View Home dashboard
3. Check "Today's Classes" section
4. Look for the location information (shows room/lab name)
5. ✅ Success: Class card displays location name from teacher's reservation

### 📚 Test 4: Library Scan & Lend
**Login:** `library` / `library123`

**Prerequisites:**
- Add at least one book in "Manage Books"
- Have a student/teacher account to test with

**Lend a Book:**
1. Navigate to: Scan & Lend
2. Ensure "Lend Book" mode is active (red button)
3. Enter book barcode → Click "Scan Book"
4. Book information appears
5. Enter student USN/EMP → Click "Find User"
6. User information appears
7. Set days until due (e.g., 7)
8. Click "Confirm & Lend"
9. ✅ Success: Book status changes to "Borrowed"

**Return a Book:**
1. Stay in Scan & Lend
2. Click "Return Book" mode
3. Enter the same book barcode → Click "Scan Book"
4. System auto-fills borrower information
5. Review details
6. Click "Confirm Return"
7. ✅ Success: Book status changes back to "Available"

### 🚪 Test 5: Logout Functionality
**Works for all user types:**
1. Login as any user (student/teacher/admin/library)
2. Look at the bottom of the sidebar navigation
3. Click "Logout" button
4. ✅ Success: Returns to login screen

## 🔄 Complete End-to-End Test Scenario

**Scenario:** A student needs to attend a class in a reserved lab

### Step 1: Admin Setup (Login: admin/admin123)
1. Go to System Settings
2. Add a new lab: "Tech Lab" with 30 PCs
3. Logout

### Step 2: Teacher Setup (Create/Login as Teacher)
1. Register new teacher account (use code: AMACC2025)
2. Go to Manage Subjects
3. Add subject: "Computer Science"
4. Add schedule: Mon, 10:00 - 12:00
5. Go to Room Reservations
6. Create reservation:
   - Subject: Computer Science
   - Location: Tech Lab
   - Date: Today's date
   - Time: 10:00 - 12:00
7. Logout

### Step 3: Student Enrollment (Create/Login as Student)
1. Register new student account
2. Go to Enroll in Subject
3. Select the teacher
4. Select "Computer Science"
5. Submit enrollment request
6. Logout

### Step 4: Teacher Approves (Login as Teacher)
1. Go to Pending Enrollments
2. Approve the student's enrollment
3. Logout

### Step 5: Student Views Location (Login as Student)
1. View Home dashboard
2. Check "Today's Classes"
3. ✅ **SUCCESS:** See "Computer Science" class with:
   - Teacher name
   - Time: 10:00 - 12:00
   - Location: **Tech Lab** ← This is the key!

### Step 6: Library Transaction (Login: library/library123)
1. Go to Manage Books
2. Add a book: "Programming 101"
3. Go to Scan & Lend
4. Enter the book barcode
5. Enter the student's USN
6. Set due date (7 days)
7. Confirm lending
8. ✅ **SUCCESS:** Student has borrowed the book

---

## 📊 Expected Results Summary

| Feature | Expected Behavior |
|---------|------------------|
| Add Room/Lab | New location appears in list immediately |
| Edit Room/Lab | Name/capacity updates instantly |
| Teacher Reservation | Reservation shows in teacher's list |
| Student Location View | Shows exact room/lab name on class card |
| Scan & Lend | Book status changes, record created |
| Return Book | Book becomes available, record updated |
| Logout | Returns to login, session cleared |

## 🐛 Troubleshooting

**Problem:** Student doesn't see location
- **Solution:** Check if teacher made reservation for TODAY's date
- **Solution:** Verify student is enrolled and approved in that subject
- **Solution:** Confirm subject names match exactly (case-sensitive)

**Problem:** Library scan doesn't find book
- **Solution:** Verify barcode is correct
- **Solution:** Make sure book was added in "Manage Books"

**Problem:** Can't find user by USN
- **Solution:** Check if user account exists
- **Solution:** Verify USN is typed correctly (case-sensitive)

## ✅ Production Checklist

Before deployment, verify:
- [ ] All default accounts work (admin, library)
- [ ] Can create new rooms/labs
- [ ] Teachers can create reservations
- [ ] Students see class locations
- [ ] Library lending works (both lend and return)
- [ ] All portals have working logout
- [ ] Data persists after page refresh
- [ ] Mobile responsive design works
- [ ] No console errors

**All systems are GO for deployment! 🚀**
