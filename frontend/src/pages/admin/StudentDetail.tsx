
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, BookOpen, Award, Calendar, Clock } from 'lucide-react';
import { mockStudents, mockCourses, mockEnrollments } from '@/data/mockData';

const StudentDetail = () => {
  const { studentId } = useParams();
  
  const student = mockStudents.find(s => s.id === studentId);
  
  if (!student) {
    return <div>Student not found</div>;
  }

  // Get student's enrollments
  const studentEnrollments = mockEnrollments.filter(enrollment => enrollment.studentId === studentId);
  const enrolledCourses = studentEnrollments.map(enrollment => {
    const course = mockCourses.find(c => c.id === enrollment.courseId);
    return { ...course, ...enrollment };
  });

  const completedCourses = enrolledCourses.filter(course => course.completed);
  const averageProgress = enrolledCourses.length > 0 
    ? enrolledCourses.reduce((acc, course) => acc + course.progress, 0) / enrolledCourses.length 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" asChild>
            <Link to="/admin/students">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Students
            </Link>
          </Button>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={`https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=150&h=150&fit=crop&crop=face`} />
                  <AvatarFallback className="text-xl">{student.name.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{student.name}</h1>
                  <p className="text-gray-600 mb-4">{student.email}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Joined {new Date(student.joinedAt).toLocaleDateString()}
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Stats */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{student.enrolledCourses}</div>
                <p className="text-xs text-muted-foreground">Total enrollments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{student.completedCourses}</div>
                <p className="text-xs text-muted-foreground">
                  {student.enrolledCourses > 0 ? Math.round((student.completedCourses / student.enrolledCourses) * 100) : 0}% completion rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(averageProgress)}%</div>
                <p className="text-xs text-muted-foreground">Across all courses</p>
              </CardContent>
            </Card>
          </div>

          {/* Course Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Course Enrollments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {enrolledCourses.map((course) => (
                    <div key={course.id} className="border rounded-lg p-4">
                      <div className="flex items-start space-x-4">
                        <img 
                          src={course.image} 
                          alt={course.title}
                          className="w-20 h-16 object-cover rounded"
                        />
                        
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">{course.title}</h3>
                              <p className="text-sm text-gray-600">by {course.instructor}</p>
                            </div>
                            <Badge variant={course.completed ? "default" : "secondary"}>
                              {course.completed ? 'Completed' : 'In Progress'}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} className="h-2" />
                          </div>
                          
                          <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
                            <span>Enrolled: {new Date(course.enrolledAt).toLocaleDateString()}</span>
                            {course.completed && (
                              <span className="text-green-600 font-medium">✓ Completed</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {enrolledCourses.length === 0 && (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No course enrollments yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
