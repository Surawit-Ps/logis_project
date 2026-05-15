package env

import (
	"os"
	"strconv"
)

type Config struct {
	SecretKey       string
	Issuer          string
	ExpirationHours int64
}

func LoadConfig() Config {
	expirationHours, err := strconv.ParseInt(os.Getenv("ExpirationHours"), 10, 64)
	if err != nil {
		expirationHours = 24 // default value if not set or invalid
	}
	return Config{
		SecretKey:       os.Getenv("SecretKey"),
		Issuer:          os.Getenv("Issuer"),
		ExpirationHours: expirationHours,
	}
}

