cmake_minimum_required(VERSION 3.11)
project(blog_api CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

set(CROW_INCLUDE_DIR /home/yang/blog/backend/crow_install/include/include)
include_directories(
    ${CROW_INCLUDE_DIR}
    /usr/include/cppconn
    /usr/include/mysql
)

find_package(Threads REQUIRED)

add_executable(blog_api main.cpp)
target_link_libraries(blog_api PRIVATE
    /usr/lib/x86_64-linux-gnu/libmysqlcppconn.so
    Threads::Threads
    dl
)
