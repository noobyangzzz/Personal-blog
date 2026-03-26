#include <crow.h>
#include <mysql_driver.h>
#include <mysql_connection.h>
#include <cppconn/statement.h>
#include <cppconn/resultset.h>
#include <cppconn/prepared_statement.h>
#include <iostream>
#include <string>
#include <sstream>
#include <memory>

const std::string DB_HOST = "tcp://127.0.0.1:3306";
const std::string DB_USER = "root";
const std::string DB_PASS = "123456";
const std::string DB_NAME = "blog_db";

crow::json::wvalue sectionsToJson(sql::Connection* con) {
    crow::json::wvalue result;
    std::unique_ptr<sql::Statement> stmt(con->createStatement());
    std::unique_ptr<sql::ResultSet> rs(stmt->executeQuery(
        "SELECT id, slug, name, icon, description, color FROM sections ORDER BY id"
    ));

    int idx = 0;
    while (rs->next()) {
        crow::json::wvalue item;
        item["id"] = rs->getString("slug");
        item["name"] = rs->getString("name");
        item["icon"] = rs->getString("icon");
        item["description"] = rs->getString("description");
        item["color"] = rs->getString("color");
        result[idx++] = std::move(item);
    }
    return result;
}

crow::json::wvalue articlesToJson(sql::Connection* con, const std::string& sectionSlug = "") {
    crow::json::wvalue result;
    std::string query = R"(
        SELECT a.article_key, a.title, a.excerpt, a.author, a.views,
               a.content_path, DATE(a.created_at) as date,
               s.slug as section, s.name as section_name, s.icon as section_icon
        FROM articles a
        JOIN sections s ON a.section_id = s.id
        WHERE a.is_hidden = 0
    )";

    if (!sectionSlug.empty()) {
        query += " AND s.slug = '" + sectionSlug + "'";
    }
    query += " ORDER BY a.created_at DESC";

    std::unique_ptr<sql::Statement> stmt(con->createStatement());
    std::unique_ptr<sql::ResultSet> rs(stmt->executeQuery(query));

    int idx = 0;
    while (rs->next()) {
        crow::json::wvalue item;
        item["id"] = rs->getString("article_key");
        item["title"] = rs->getString("title");
        item["excerpt"] = rs->getString("excerpt");
        item["author"] = rs->getString("author");
        item["views"] = rs->getInt("views");
        item["content_path"] = rs->getString("content_path");
        item["date"] = rs->getString("date");
        item["section"] = rs->getString("section");
        item["section_name"] = rs->getString("section_name");
        item["section_icon"] = rs->getString("section_icon");
        result[idx++] = std::move(item);
    }
    return result;
}

crow::json::wvalue articleDetailToJson(sql::Connection* con, const std::string& articleKey) {
    crow::json::wvalue result;
    std::string query = R"(
        SELECT a.article_key, a.title, a.excerpt, a.author, a.views,
               a.content_path, DATE(a.created_at) as date,
               s.slug as section, s.name as section_name, s.icon as section_icon
        FROM articles a
        JOIN sections s ON a.section_id = s.id
        WHERE a.article_key = ')" + articleKey + R"(' AND a.is_hidden = 0
    )";

    std::unique_ptr<sql::Statement> stmt(con->createStatement());
    std::unique_ptr<sql::ResultSet> rs(stmt->executeQuery(query));

    if (rs->next()) {
        result["id"] = rs->getString("article_key");
        result["title"] = rs->getString("title");
        result["excerpt"] = rs->getString("excerpt");
        result["author"] = rs->getString("author");
        result["views"] = rs->getInt("views");
        result["content_path"] = rs->getString("content_path");
        result["date"] = rs->getString("date");
        result["section"] = rs->getString("section");
        result["section_name"] = rs->getString("section_name");
        result["section_icon"] = rs->getString("section_icon");
    }
    return result;
}

int main() {
    crow::SimpleApp app;

    CROW_ROUTE(app, "/api/sections")
        .methods("GET"_method)
        ([](const crow::request& req) {
            try {
                sql::mysql::MySQL_Driver* driver = sql::mysql::get_mysql_driver_instance();
                std::unique_ptr<sql::Connection> con(driver->connect(DB_HOST, DB_USER, DB_PASS));
                con->setSchema(DB_NAME);
                return crow::response(sectionsToJson(con.get()));
            } catch (const std::exception& e) {
                std::cerr << "Error: " << e.what() << std::endl;
                return crow::response(500, "Database error");
            }
        });

    CROW_ROUTE(app, "/api/articles")
        .methods("GET"_method)
        ([](const crow::request& req) {
            try {
                std::string section = req.url_params.get("section") ? std::string(req.url_params.get("section")) : "";
                sql::mysql::MySQL_Driver* driver = sql::mysql::get_mysql_driver_instance();
                std::unique_ptr<sql::Connection> con(driver->connect(DB_HOST, DB_USER, DB_PASS));
                con->setSchema(DB_NAME);
                return crow::response(articlesToJson(con.get(), section));
            } catch (const std::exception& e) {
                std::cerr << "Error: " << e.what() << std::endl;
                return crow::response(500, "Database error");
            }
        });

    CROW_ROUTE(app, "/api/article")
        .methods("GET"_method)
        ([](const crow::request& req) {
            try {
                auto articleKey = req.url_params.get("id");
                if (!articleKey) {
                    return crow::response(400, "Missing article id");
                }
                sql::mysql::MySQL_Driver* driver = sql::mysql::get_mysql_driver_instance();
                std::unique_ptr<sql::Connection> con(driver->connect(DB_HOST, DB_USER, DB_PASS));
                con->setSchema(DB_NAME);
                crow::json::wvalue result = articleDetailToJson(con.get(), std::string(articleKey));
                if (result.size() == 0) {
                    return crow::response(404, "Article not found or hidden");
                }
                return crow::response(result);
            } catch (const std::exception& e) {
                std::cerr << "Error: " << e.what() << std::endl;
                return crow::response(500, "Database error");
            }
        });

    CROW_ROUTE(app, "/api/visit")
        .methods("POST"_method)
        ([](const crow::request& req) {
            try {
                auto article = req.url_params.get("article");
                auto section = req.url_params.get("section");
                if (!article || !section) {
                    return crow::response(400, "Missing parameters");
                }

                sql::mysql::MySQL_Driver* driver = sql::mysql::get_mysql_driver_instance();
                std::unique_ptr<sql::Connection> con(driver->connect(DB_HOST, DB_USER, DB_PASS));
                con->setSchema(DB_NAME);

                // Try X-Real-IP first (set by Nginx), fallback to direct IP
                std::string clientIp = req.get_header_value("X-Real-IP");
                if (clientIp.empty()) {
                    clientIp = req.get_header_value("X-Forwarded-For");
                }
                if (clientIp.empty()) {
                    clientIp = req.remote_ip_address;
                }
                std::string userAgent = req.get_header_value("User-Agent");
                if (userAgent.length() > 500) userAgent = userAgent.substr(0, 500);

                std::unique_ptr<sql::Statement> stmt(con->createStatement());

                std::string articleIdQuery = "SELECT id FROM articles WHERE article_key = '" + std::string(article) + "'";
                std::unique_ptr<sql::ResultSet> rs(stmt->executeQuery(articleIdQuery));

                if (rs->next()) {
                    int articleId = rs->getInt("id");
                    stmt->execute("INSERT INTO article_views (article_id, ip_address, user_agent) VALUES (" +
                        std::to_string(articleId) + ", '" + clientIp + "', '" + userAgent + "')");
                    stmt->execute("UPDATE articles SET views = views + 1 WHERE id = " + std::to_string(articleId));
                }

                crow::json::wvalue result;
                result["success"] = true;
                return crow::response(result);
            } catch (const std::exception& e) {
                std::cerr << "Error: " << e.what() << std::endl;
                return crow::response(500, "Database error");
            }
        });

    std::cout << "Blog API starting on port 8080..." << std::endl;
    app.port(8080).multithreaded().run();
}
